"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
exports.createError = {
    badRequest: (message = 'Bad Request') => new AppError(message, 400),
    unauthorized: (message = 'Unauthorized') => new AppError(message, 401),
    forbidden: (message = 'Forbidden') => new AppError(message, 403),
    notFound: (message = 'Not Found') => new AppError(message, 404),
    conflict: (message = 'Conflict') => new AppError(message, 409),
    unprocessableEntity: (message = 'Unprocessable Entity') => new AppError(message, 422),
    internalServer: (message = 'Internal Server Error') => new AppError(message, 500),
};
//# sourceMappingURL=AppError.js.map