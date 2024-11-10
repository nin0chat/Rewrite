import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { Controller, GET, POST } from "fastify-decorators";
import { checkCredentials, generateToken } from "../common/auth";
import { validateCaptcha } from "../common/captcha";
import { __DEV__, SALT } from "../common/constants";
import { prismaClient } from "../common/database";
import { sendEmail } from "../common/email";
import { ErrorCode, RESTError } from "../common/error";
import { shouldModerate } from "../common/moderate";
import { Snowflake } from "../common/Snowflake";

type LoginBody = {
    email: string;
    password: string;
};

type SignupBody = {
    username: string;
    email: string;
    password: string;
    turnstileKey: string;
};

@Controller({ route: "/auth" })
export default class AuthController {
    @POST({
        url: "/login",
        options: {
            schema: {
                body: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" }
                    }
                }
            }
        }
    })
    async loginHandler(req, res) {
        const body = req.body as LoginBody;
        const auth = await checkCredentials(body.email, body.password);

        return {
            id: auth.toString(),
            token: (await generateToken(auth, true)).full
        };
    }

    @POST({
        url: "/signup",
        options: {
            schema: {
                body: {
                    type: "object",
                    required: ["username", "email", "password", "turnstileKey"],
                    properties: {
                        username: { type: "string" },
                        email: { type: "string", format: "email" },
                        password: { type: "string" },
                        turnstileKey: { type: "string" }
                    }
                }
            }
        }
    })
    async signupHandler(req, res) {
        const body = req.body as SignupBody;
        if (!(await validateCaptcha(body.turnstileKey)))
            throw new RESTError(ErrorCode.ValidationError, "Invalid captcha");

        const existing = await prismaClient.user.count({
            where: {
                OR: [{ email: body.email }, { username: body.username }]
            }
        });

        // Check for existing info
        if (existing > 0)
            throw new RESTError(ErrorCode.ConflictError, "Username or email already exists");

        // Moderate username
        if (shouldModerate(body.username))
            throw new RESTError(ErrorCode.ValidationError, "Username contains restricted words");

        // Hash password
        const hashedPassword = await hash(body.password, SALT);

        // Add user to database
        const newUserID = Snowflake.generate();
        await prismaClient.user.create({
            data: {
                id: BigInt(newUserID),
                username: body.username,
                email: body.email,
                password: hashedPassword
            }
        });

        // Generate confirm email
        const emailConfirmToken = encodeURIComponent(
            randomBytes(60).toString("base64").replace("+", "")
        );
        await prismaClient.emailVerification.create({
            data: {
                id: BigInt(newUserID),
                token: emailConfirmToken
            }
        });

        sendEmail([body.email], "Confirm your nin0chat registration", "7111988", {
            name: body.username,
            confirm_url: `https://${req.hostname}/api/auth/confirm?token=${emailConfirmToken}`
        });
        if (__DEV__)
            await prismaClient.user.update({
                where: { id: BigInt(newUserID) },
                data: { activated: true }
            });

        return res.code(201).send();
    }

    @GET({
        url: "/confirm",
        options: {
            schema: {
                querystring: {
                    type: "object",
                    required: ["token"],
                    properties: {
                        token: { type: "string" }
                    }
                }
            }
        }
    })
    async confirmHandler(req, res) {
        const token = (req.query as any).token;

        // Check if the token is valid
        const ticket = await prismaClient.emailVerification.findFirst({ where: { token: token } });

        if (!ticket) throw new RESTError(ErrorCode.NotFoundError, "Invalid token");

        // Delete token and activate the user
        await prismaClient.emailVerification.delete({ where: { token: token } });
        await prismaClient.user.update({
            where: { id: ticket.id },
            data: { activated: true }
        });
        return res.redirect(`https://${process.env.CLIENT_HOSTNAME}/login?confirmed=true`);
    }
}
