import fastify from "fastify";
import { readdirSync } from "fs";
import { prod } from "./common/constants";

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

const modules = readdirSync(`./${prod ? "dist" : "src"}/rest`);
for (const module of modules) {
    server.log.info(`Loading ${module}`);
    server.register(import(`./rest/${module.replace(".ts", "")}`), {
        prefix: `/api/${module.replace(".ts", "")}`
    });
}

server.listen({ port: parseInt(process.env.PORT), host: process.env.HOST }, (err, address) => {
    if (err) {
        server.log.error(err);
    }

    server.log.info(`Server listening at ${address}:${process.env.PORT}`);
});
