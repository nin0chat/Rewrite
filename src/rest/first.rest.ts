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
    async helloHandler() {
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
    async goodbyeHandler() {
        return "Bye-bye!";
    }
}