import { User as UserEntity } from "@prisma/client";

export type User = {
    id: string;
    username: string;
    email?: string;
    password?: string;
    activated?: boolean;
    role: number;
};

export const sanitiseUser = (user: UserEntity): User => {
    return {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        activated: user.activated,
        role: Number(user.role)
    };
};

export type Token = {
    userID: bigint;
    seed: number;
    token: string;
    full: string;
};

export type Arguments<T> = T extends (...args: infer U) => any ? U : never;
export type Argument<T, Index extends number> = Arguments<T>[Index];
