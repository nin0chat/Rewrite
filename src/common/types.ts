export type User = {
    id: bigint;
    username: string;
    email?: string;
    bot: boolean;
    password?: string;
    activated?: boolean;
    role: number;
};

export type Token = {
    userID: bigint;
    seed: number;
    token: string;
    full: string;
};
