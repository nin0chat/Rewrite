import pg from "pg";

const { Client } = pg;
let connectionString = process.env.POSTGRES_FULL_URL;

if (!process.env.POSTGRES_FULL_URL) {
    const { POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

    if (!POSTGRES_URL || !POSTGRES_USER || !POSTGRES_PASSWORD) {
        throw new Error("Missing POSTGRES_URL, POSTGRES_USER, or POSTGRES_PASSWORD");
    }

    connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_URL}`;
}

export const psqlClient = new Client({
    connectionString: connectionString,
});

psqlClient.connect();
