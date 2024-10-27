import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { SALT } from "./constants";
import { psqlClient } from "./database";
import { ErrorCode, RESTError } from "./error";
import { Token, User } from "./types";

export async function checkCredentials(email: string, password: string): Promise<bigint> {
    const userQuery = await psqlClient.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!userQuery.rowCount)
        throw new RESTError(ErrorCode.AuthError, "Invalid username or password");

    const potentialUser: User = userQuery.rows[0];

    const auth = await compare(password, potentialUser.password);
    if (!auth) {
        throw new RESTError(ErrorCode.AuthError, "Invalid username or password");
    }
    if (!potentialUser.activated)
        throw new RESTError(ErrorCode.AuthError, "Check your email to activate your account");

    return potentialUser.id;
}

export async function generateToken(userID: bigint, addToDatabase: boolean): Promise<Token> {
    const token = randomBytes(60).toString("base64").replace("+", "");
    const hashedToken = await hash(token, SALT);
    const seed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    if (addToDatabase)
        await psqlClient.query("INSERT INTO tokens (id, seed, token) VALUES ($1, $2, $3)", [
            userID,
            seed,
            hashedToken
        ]);
    return {
        userID,
        seed,
        token,
        full: `${userID}.${seed}.${token}`
    };
}

export const authHook = async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;

    if (!auth) return;

    const [userID, seed, token] = auth.split(".");

    const tokenQuery = await psqlClient.query("SELECT * FROM tokens WHERE id=$1 AND seed=$2", [
        userID,
        seed
    ]);
    if (!tokenQuery.rowCount) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    const potentialToken = tokenQuery.rows[0];

    const authed = await compare(token, potentialToken.token);

    if (!authed) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    const user = await psqlClient.query("SELECT * FROM users WHERE id=$1", [userID]);

    if (!user.rowCount) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    req.user = user.rows[0];
};

declare module "fastify" {
    interface FastifyRequest {
        user: User;
    }
}
