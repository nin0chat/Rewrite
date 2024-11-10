import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { SALT } from "./constants";
import { prismaClient } from "./database";
import { ErrorCode, RESTError } from "./error";
import { Token } from "./types";
import { User } from "@prisma/client";

export async function checkCredentials(email: string, password: string): Promise<bigint> {
    const user = await prismaClient.user.findUnique({ where: { email: email } });

    if (!user) throw new RESTError(ErrorCode.AuthError, "Invalid username or password");

    const auth = await compare(password, user.password);
    if (!auth) {
        throw new RESTError(ErrorCode.AuthError, "Invalid username or password");
    }

    if (!user.activated)
        throw new RESTError(ErrorCode.AuthError, "Check your email to activate your account");

    return user.id;
}

export async function generateToken(userID: bigint, addToDatabase: boolean): Promise<Token> {
    const token = randomBytes(60).toString("base64").replace("+", "");
    const hashedToken = await hash(token, SALT);
    const seed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    if (addToDatabase)
        await prismaClient.token.create({
            data: {
                id: userID,
                seed: seed.toString(),
                token: hashedToken
            }
        });

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
    const potentialToken = await prismaClient.token.findFirst({
        where: {
            id: BigInt(userID),
            seed: seed
        }
    });

    if (!potentialToken) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    const authed = await compare(token, potentialToken.token);
    if (!authed) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    const user = await prismaClient.user.findUnique({ where: { id: BigInt(userID) } });
    if (!user) {
        throw new RESTError(ErrorCode.AuthError, "Invalid token");
    }

    req.user = user;
};

declare module "fastify" {
    interface FastifyRequest {
        user: User;
    }
}
