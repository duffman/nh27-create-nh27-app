"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validation_1 = require("../utils/validation");
const validationSchemas_1 = require("../utils/validationSchemas");
const router = (0, express_1.Router)();
router.post('/chat/initiate', authMiddleware_1.authMiddleware, chatController_1.initiateChat);
router.post('/chat/message', authMiddleware_1.authMiddleware, (0, validation_1.validateRequest)(validationSchemas_1.chatMessageSchema), chatController_1.sendMessage);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map