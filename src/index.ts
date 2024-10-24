import Fastify from "fastify";

const server = Fastify({
    logger: process.env.NODE_ENV === "development"
});

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        server.log.error(err);
    }
});
