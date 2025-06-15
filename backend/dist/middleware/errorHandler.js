"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, next) {
    console.error('Error:', err);
    if (res.headersSent) {
        return next(err);
    }
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}
