import pg from "pg";

const { Client } = pg;

export const psqlClient = new Client({
    connectionString: process.env.POSTGRES_URL
});

psqlClient.connect();
