export type User = {
    id: bigint;
    username: string;
    email?: string;
    password?: string;
    activated?: boolean;
    role: number;
};
