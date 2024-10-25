import { FastifyReply } from "fastify";

export enum ErrorCode {
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
    code: ErrorCode,
    message: string,
    extra: any = {}
): object {
    if (location === "rest") {
        switch (code) {
            case ErrorCode.ValidationError: {
                res.code(400);
                return {
                    code,
                    message
                };
            }
            case ErrorCode.AuthError: {
                res.code(403);
                return {
                    code,
                    message
                };
            }
            case ErrorCode.ConflictError: {
                res.code(409);
                return {
                    code,
                    message
                };
            }
            default: {
                res.code(400);
            }
        }
        return {
            code,
            message
        };
    } else {
        return {}; // tbd
    }
}
