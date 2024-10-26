import Fastify, { FastifyInstance } from "fastify";
import { Controller, GET } from "fastify-decorators";

import { ErrorCode, sendError } from "../common/error";
import { psqlClient } from "../common/database";
import { compare, genSalt, hash } from "bcrypt";
import { User } from "../common/types";
import { generateToken, checkCredentials } from "../common/auth";
import { validateCaptcha } from "../common/captcha";
import { shouldModerate } from "../common/moderate";
import { isDev, salt } from "../common/constants";
import { randomBytes } from "crypto";
import { sendEmail } from "../common/email";
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

async function plugin(fst: FastifyInstance, opts) {
    fst.post(
        "/login",
        {
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
        },
        async (req, res) => {
            const body = req.body as LoginBody;
            const auth = await checkCredentials(body.email, body.password);

            if (!auth.success) {
                switch (auth.error) {
                    case "accountNotActivated":
                        return sendError(
                            res,
                            "rest",
                            ErrorCode.AuthError,
                            "Check your email to activate your account"
                        );
                    case "invalidCredentials":
                        return sendError(
                            res,
                            "rest",
                            ErrorCode.AuthError,
                            "Invalid username or password"
                        );
                }
                return { token: await generateToken(auth.id, true) };
            }
        }
    );

    fst.post(
        "/signup",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["username", "email", "password", "turnstileKey"],
                    properties: {
                        username: { type: "string", minLength: 2, maxLength: 30 },
                        email: { type: "string", format: "email" },
                        password: { type: "string" },
                        turnstileKey: { type: "string" }
                    }
                }
            }
        },
        async (req, res) => {
            const body = req.body as SignupBody;
            if (!(await validateCaptcha(body.turnstileKey)))
                return sendError(
                    res,
                    "rest",
                    ErrorCode.ValidationError,
                    "CAPTCHA is expired or invalid"
                );

            // Check for existing info
            if (
                await psqlClient.query("SELECT id FROM users WHERE username=$1 OR email=$2", [
                    body.username,
                    body.email
                ])
            )
                return sendError(
                    res,
                    "rest",
                    ErrorCode.ConflictError,
                    "Username or email are already registered"
                );

            // Moderate username
            if (shouldModerate(body.username).newText !== body.username) {
                return sendError(
                    res,
                    "rest",
                    ErrorCode.DataError,
                    "Username contains restricted words"
                );
            }

            // Hash password
            const hashedPassword = await hash(body.password, salt);

            // Add user to database
            const newUserID = Snowflake.generate();
            await psqlClient.query(
                "INSERT INTO users (id, username, email, password)  VALUES ($1, $2, $3, $4)",
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
            if (isDev)
                await psqlClient.query("UPDATE users SET activated=true WHERE id=$1", [newUserID]);

            return res.code(201).send();
        }
    );

    fst.get(
        "/api/confirm",
        {
            schema: {
                querystring: {
                    type: "object",
                    required: ["token"],
                    properties: {
                        token: { type: "string" }
                    }
                }
            }
        },
        async function handler(request, res) {
            const token = (request.query as any).token;

            // Check if token is valid
            const query = await psqlClient.query(
                "SELECT id FROM email_verifications WHERE token=$1",
                [token]
            );
            if (query.rows.length === 0) {
                return sendError(res, "rest", ErrorCode.DataError, "Invalid verify token");
            }

            // Delete token
            await psqlClient.query("DELETE FROM email_verifications WHERE token=$1", [token]);
            await psqlClient.query("UPDATE users SET activated=true WHERE id=$1", [
                query.rows[0].id
            ]);
            return res.redirect(`https://${process.env.CLIENT_HOSTNAME}/login?confirmed=true`);
        }
    );
}

export default plugin;
