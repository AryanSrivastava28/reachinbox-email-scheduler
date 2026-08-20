"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listScheduled = listScheduled;
exports.listSent = listSent;
const campaignService_1 = require("../services/campaignService");
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
async function listScheduled(req, res, next) {
    try {
        const parsed = validation_1.paginationSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: "Invalid pagination params" });
            return;
        }
        const { page, limit } = parsed.data;
        const result = await campaignService_1.campaignService.listEmails(req.user.id, "scheduled", page, limit);
        (0, response_1.ok)(res, (0, response_1.paginate)(result.items, result.page, result.limit, result.total));
    }
    catch (err) {
        next(err);
    }
}
async function listSent(req, res, next) {
    try {
        const parsed = validation_1.paginationSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: "Invalid pagination params" });
            return;
        }
        const { page, limit } = parsed.data;
        const result = await campaignService_1.campaignService.listEmails(req.user.id, "sent", page, limit);
        (0, response_1.ok)(res, (0, response_1.paginate)(result.items, result.page, result.limit, result.total));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=emailController.js.map