"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.zodErrorHandler = zodErrorHandler;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(result.error);
        }
        req.body = result.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            return next(result.error);
        }
        req.query = result.data;
        next();
    };
}
function zodErrorHandler(err, _req, res, next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: "Validation failed",
            details: err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }
    next(err);
}
//# sourceMappingURL=validate.js.map