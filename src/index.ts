import fastify from "fastify";
import { readdirSync } from "fs";
import { prod } from "./common/constants";

import { resolve } from "path";
import { bootstrap } from "fastify-decorators";

const envToLogger = {};
const { SERVER_HOST, SERVER_PORT } = process.env;

export const server = fastify({
    logger: {
        development: {
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname"
                }
            }
        },
        production: false
    }[process.env.NODE_ENV]
});

server.register(bootstrap, {
    directory: resolve(__dirname, "rest"),
    mask: /\.rest\./
});

server.listen({ port: Number(SERVER_PORT), host: SERVER_HOST }, (err, address) => {
    if (err) {
        server.log.error(err);
    }

    server.log.info(`Server listening at ${address}:${SERVER_PORT}`);
});
