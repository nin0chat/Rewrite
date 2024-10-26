import "dotenv/config.js";
import fastify from "fastify";

import { bootstrap } from "fastify-decorators";
import { resolve } from "path";
import { ERROR_HANDLER } from "./common/error.js";

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
    prefix: "/api"
});

server.setErrorHandler(ERROR_HANDLER);

server.listen({ port: parseInt(process.env.PORT), host: process.env.HOST }, (err, address) => {
    if (err) {
        server.log.error(err);
    }
});
