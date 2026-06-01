"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    logger_1.logger.error(`[API Error] ${statusCode} - ${message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    if (process.env.NODE_ENV === 'development' && err.stack) {
        logger_1.logger.error(err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
