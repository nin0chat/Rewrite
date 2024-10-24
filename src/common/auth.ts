import { compare, genSalt, hash } from "bcrypt";
import { psqlClient } from "./database";
import { sendError, ErrorCodes } from "./error";
import { User } from "./types";
import { randomBytes } from "crypto";
import { salt } from "./constants";

export async function checkCredentials(
    email: string,
    password: string
): Promise<{
    success: boolean;
    id?: bigint;
    error?: "invalidCredentials" | "invalidTOTP" | "accountNotActivated";
}> {
    const potentialUser = (await psqlClient.query("SELECT * FROM users WHERE email=$1", [email]))
        .rows[0] as User;
    const auth = await compare(password, potentialUser.password);
    if (!auth) {
        return {
            success: false,
            error: "invalidCredentials"
        };
    }
    if (!potentialUser.activated)
        return {
            success: false,
            error: "accountNotActivated"
        };
    return {
        success: true,
        id: potentialUser.id
    };
}

export async function addToken(userID: bigint): Promise<string> {
    const token = randomBytes(60).toString("base64").replace("+", "");
    const hashedToken = await hash(token, salt);
    const seed = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    await psqlClient.query("INSERT INTO tokens VALUES ($1, $2, $3)", [userID, seed, hashedToken]);
    return `${userID}.${seed}.${token}`;
}
