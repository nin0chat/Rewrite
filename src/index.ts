import Fastify from "fastify";
import { readdirSync } from "fs";
import { prod } from "./utils/constants";

export const server = Fastify({
    logger: !prod
});

const modules = readdirSync(`./${prod ? "dist" : "src"}/rest`);
for (const module of modules) {
    server.log.info(`Loading ${module}`);
    server.register(import(`./rest/${module.replace(".ts", "")}`));
}

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        server.log.error(err);
    }
});
