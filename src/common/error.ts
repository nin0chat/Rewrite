import { FastifyReply } from "fastify";

export enum ErrorCodes {
    ValidationError,
    AuthError,
    MessageError,
    DataError,
    ConflictError,
    PermissionError
}
export function sendError(
    res: FastifyReply,
    location: "ws" | "rest",
    code: ErrorCodes,
    message: string,
    extra: any = {}
): object {
    if (location === "rest") {
        switch (code) {
            case ErrorCodes.ValidationError: {
                res.code(400);
                return {
                    code,
                    message
                };
            }
            case ErrorCodes.AuthError: {
                res.code(403);
                return {
                    code,
                    message
                };
            }
            case ErrorCodes.ConflictError: {
                res.code(409);
                return {
                    code,
                    message
                };
            }
            default: {
                res.code(400);
                return {
                    code,
                    message
                };
            }
        }
    } else {
        return {}; // tbd
    }
}
