"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
exports.createError = createError;
const client_1 = require("@prisma/client");
function notFound(_req, res) {
    res.status(404).json({ success: false, error: "Resource not found" });
}
function errorHandler(err, _req, res, _next) {
    const status = err.status ?? 500;
    const message = status >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message ?? "Internal server error";
    if (status >= 500) {
        console.error("[error]", err);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({ success: false, error: `Database error: ${err.code}` });
        return;
    }
    res.status(status).json({ success: false, error: message });
}
function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}
//# sourceMappingURL=error.js.map