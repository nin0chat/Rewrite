import { Controller, GET } from "fastify-decorators";

@Controller({ route: "/" })
export default class ControllerTest {
    @GET({
        url: "/hello",
        options: {
            schema: {
                response: {
                    200: {
                        type: "string"
                    }
                }
            }
        }
    })
    async helloHandler(req, res) {
        if (req.query.name) {
            return `Hello, ${req.query.name}!`;
        }

        return "Hello world!";
    }

    @GET({
        url: "/goodbye",
        options: {
            schema: {
                response: {
                    200: {
                        type: "string"
                    }
                }
            }
        }
    })
    async goodbyeHandler(req, res) {
        if (req.query.name) {
            return `Goodbye, ${req.query.name}!`;
        }

        return "Bye-bye!";
    }

    @GET({
        url: "/hello/:name",
        options: {
            schema: {
                response: {
                    200: {
                        type: "string"
                    }
                }
            }
        }
    })
    async nameHandler(req, res) {
        return `Hello, ${req.params.name}!`;
    }
}
