import fastify from "fastify";
import { readdirSync } from "fs";
import { isDev } from "./common/constants";

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
    mask: /\.rest\./,
    prefix: "/api"
});

server.listen({ port: parseInt(process.env.PORT), host: process.env.HOST }, (err, address) => {
    if (err) {
        server.log.error(err);
    }

    server.log.info(`Server listening at ${address}:${process.env.PORT}`);
});
