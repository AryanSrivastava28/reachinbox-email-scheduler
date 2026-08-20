"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
exports.paginate = paginate;
function ok(res, data, status = 200) {
    return res.status(status).json({ success: true, data });
}
function fail(res, error, status = 400) {
    return res.status(status).json({ success: false, error });
}
function paginate(items, page, limit, total) {
    return {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
//# sourceMappingURL=response.js.map