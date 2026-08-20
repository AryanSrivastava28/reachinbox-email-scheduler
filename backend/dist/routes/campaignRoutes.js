"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaignController_1 = require("../controllers/campaignController");
const validate_1 = require("../middleware/validate");
const validation_1 = require("../utils/validation");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
router.post("/", (0, validate_1.validateBody)(validation_1.createCampaignSchema), (0, asyncHandler_1.asyncHandler)(campaignController_1.createCampaign));
router.get("/:id", (0, asyncHandler_1.asyncHandler)(campaignController_1.getCampaign));
exports.default = router;
//# sourceMappingURL=campaignRoutes.js.map