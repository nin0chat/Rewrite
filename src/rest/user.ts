import { Controller, GET } from "fastify-decorators";
import { RESTError } from "../common/error.js";
import { sanitiseUser } from "../common/types.js";
import { FastifyRequest } from "fastify";

@Controller({ route: "/users" })
export default class UserController {
    @GET({
        url: "/me"
    })
    async helloHandler(req: FastifyRequest, res) {
        // TODO: add a decorator?
        if (!req.user) throw RESTError.Authed;

        return sanitiseUser(req.user);
    }
}
