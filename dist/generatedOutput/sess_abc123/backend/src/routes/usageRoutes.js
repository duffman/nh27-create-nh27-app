"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usageController_1 = require("../controllers/usageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/usage', authMiddleware_1.authMiddleware, usageController_1.logUsage);
router.get('/usage/:id', authMiddleware_1.authMiddleware, usageController_1.getUserUsage);
exports.default = router;
//# sourceMappingURL=usageRoutes.js.map