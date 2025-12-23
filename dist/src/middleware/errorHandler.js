export function errorHandler(error, _req, res, _next) {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({
        error: {
            message,
            status,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
}
//# sourceMappingURL=errorHandler.js.map