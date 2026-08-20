"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailController_1 = require("../controllers/emailController");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
router.get("/scheduled", (0, asyncHandler_1.asyncHandler)(emailController_1.listScheduled));
router.get("/sent", (0, asyncHandler_1.asyncHandler)(emailController_1.listSent));
exports.default = router;
//# sourceMappingURL=emailRoutes.js.map