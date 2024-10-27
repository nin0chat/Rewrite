import { Client } from "pg";

export const psqlClient = new Client({
    connectionString: process.env.POSTGRES_URL
});

psqlClient.connect();
