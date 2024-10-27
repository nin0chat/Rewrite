export type User = {
    id: bigint;
    username: string;
    email?: string;
    bot: boolean;
    password?: string;
    activated?: boolean;
    role: number;
};

export const sanitiseUser = (user: User): User => {
    const { password, ...sanitised } = user;

    return sanitised;
};

export type Token = {
    userID: bigint;
    seed: number;
    token: string;
    full: string;
};

export type Arguments<T> = T extends (...args: infer U) => any ? U : never;
export type Argument<T, Index extends number> = Arguments<T>[Index];
