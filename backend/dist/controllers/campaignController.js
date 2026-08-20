"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = createCampaign;
exports.getCampaign = getCampaign;
const campaignService_1 = require("../services/campaignService");
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
const error_1 = require("../middleware/error");
async function createCampaign(req, res, next) {
    try {
        const parsed = validation_1.createCampaignSchema.safeParse(req.body);
        if (!parsed.success) {
            throw (0, error_1.createError)(400, parsed.error.errors[0]?.message ?? "Invalid input");
        }
        const user = req.user;
        const result = await campaignService_1.campaignService.createCampaign(user.id, parsed.data);
        (0, response_1.ok)(res, result, 201);
    }
    catch (err) {
        next(err);
    }
}
async function getCampaign(req, res, next) {
    try {
        const user = req.user;
        const campaign = await campaignService_1.campaignService.getCampaign(user.id, String(req.params.id));
        if (!campaign) {
            throw (0, error_1.createError)(404, "Campaign not found");
        }
        (0, response_1.ok)(res, campaign);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=campaignController.js.map