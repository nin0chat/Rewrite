import fastify from "fastify";

import { bootstrap } from "fastify-decorators";
import { resolve } from "path";
import { __DEV__ } from "./common/constants.js";
import { ERROR_HANDLER } from "./common/error.js";
import { Yapper } from "./common/Yapper.js";

export const server = fastify({
    loggerInstance: new Yapper("a")
});

server.register(bootstrap, {
    directory: resolve(__dirname, "rest"),
    mask: /\.rest\./,
    prefix: "/api"
});

server.setErrorHandler(ERROR_HANDLER);

if (__DEV__) {
    server.log.trace("Trace message");
    server.log.debug("Debug message");
    server.log.info("Info message");
    server.log.warn("Warn message");
    server.log.error("Error message");
    server.log.fatal("I killed myself");
}

server.listen({ port: parseInt(process.env.PORT), host: process.env.HOST }, (err, address) => {
    if (err) {
        server.log.error(err);
    }
});
