import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { Controller, GET, POST } from "fastify-decorators";
import { checkCredentials, generateToken } from "../common/auth";
import { validateCaptcha } from "../common/captcha";
import { __DEV__, SALT } from "../common/constants";
import { psqlClient } from "../common/database";
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

            return { token: await generateToken(auth, true) };
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

        // Check for existing info
        if (
            await psqlClient.query("SELECT id FROM users WHERE username=$1 OR email=$2", [
                body.username,
                body.email
            ])
        )
            throw new RESTError(ErrorCode.ConflictError, "Username or email already exists");

        // Moderate username
        if (shouldModerate(body.username)) 
            throw new RESTError(ErrorCode.ValidationError, "Username contains restricted words");

        // Hash password
        const hashedPassword = await hash(body.password, SALT);

        // Add user to database
        const newUserID = Snowflake.generate();
        await psqlClient.query(
            "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4)",
            [newUserID, body.username, body.email, hashedPassword]
        );

        // Generate confirm email
        const emailConfirmToken = encodeURIComponent(
            randomBytes(60).toString("base64").replace("+", "")
        );
        await psqlClient.query("INSERT INTO email_verifications (id, token) VALUES ($1, $2)", [
            newUserID,
            emailConfirmToken
        ]);

        sendEmail([body.email], "Confirm your nin0chat registration", "7111988", {
            name: body.username,
            confirm_url: `https://${req.hostname}/api/confirm?token=${emailConfirmToken}`
        });
        if (__DEV__)
            await psqlClient.query("UPDATE users SET activated=true WHERE id=$1", [newUserID]);

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

        // Check if token is valid
        const query = await psqlClient.query(
            "SELECT id FROM email_verifications WHERE token=$1",
            [token]
        );
        if (query.rows.length === 0) 
            throw new RESTError(ErrorCode.NotFoundError, "Invalid token");

        // Delete token
        await psqlClient.query("DELETE FROM email_verifications WHERE token=$1", [token]);
        await psqlClient.query("UPDATE users SET activated=true WHERE id=$1", [
            query.rows[0].id
        ]);
        return res.redirect(`https://${process.env.CLIENT_HOSTNAME}/login?confirmed=true`);
    }
}