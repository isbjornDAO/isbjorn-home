"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });
    if (error instanceof AppError_1.AppError && error.isOperational) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
        });
    }
    // Production error response
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
    // Development error response
    res.status(500).json({
        status: 'error',
        message: error.message,
        stack: error.stack,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map