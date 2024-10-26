import { FastifyInstance, FastifyReply } from "fastify";
import { __DEV__ } from "./constants.js";
import { Argument } from "./types.js";

export enum ErrorCode {
    ValidationError,
    AuthError,
    MessageError,
    DataError,
    ConflictError,
    PermissionError,
    NotFoundError
}

/**
 * @abstract -- Don't use directly
 */
export abstract class APIError extends Error {
    abstract location: "ws" | "rest";
    abstract extra: Record<string, any> & { validation?: any; stack?: string };
    abstract statusCode: number;

    constructor(
        public code: ErrorCode,
        message: string
    ) {
        super(message);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            stack: __DEV__ ? this.stack : undefined,
            ...this.extra
        };
    }
}

export class RESTError extends APIError {
    location: "rest" = "rest";

    constructor(
        code: ErrorCode,
        message: string,
        public extra: any = {}
    ) {
        super(code, message);
    }

    get statusCode() {
        switch (this.code) {
            case ErrorCode.ValidationError:
                return 400;
            case ErrorCode.AuthError:
                return 403;
            case ErrorCode.NotFoundError:
                return 404;
            case ErrorCode.ConflictError:
                return 409;
            default:
                return 500;
        }
    }
}

export class SocketError extends APIError {
    location: "ws" = "ws";

    constructor(
        code: ErrorCode,
        message: string,
        public extra: any = {}
    ) {
        super(code, message);
    }

    statusCode = 500;
    message = "Internal Server Error";
}

/**
 * @deprecated -- Use {@link RESTError} or {@link SocketError} instead
 */
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

export const ERROR_HANDLER: Argument<FastifyInstance["setErrorHandler"], 0> = function (
    error,
    _request,
    reply
) {
    const payload = {
        code: 500,
        message: "Internal Server Error",
        stack: undefined,
        validation: undefined
    };

    // don't cache server errors
    reply.header("Cache-Control", "max-age=1, must-revalidate").header("Pragma", "no-cache");

    if (error instanceof APIError) {
        reply.code(error.statusCode).send(error.toJSON());
        return;
    } else if (payload.validation) {
        reply.code(400).send({
            code: 400,
            message: "Validation Error",
            validation: payload.validation
        });
        return;
    }

    payload.stack = __DEV__ ? error.stack : undefined;

    reply.send(payload);
};
