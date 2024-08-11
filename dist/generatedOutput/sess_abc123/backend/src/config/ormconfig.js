"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const usage_1 = require("../models/usage");
const chatSession_1 = require("../models/chatSession");
const chatMessage_1 = require("../models/chatMessage");
const userSettings_1 = require("../models/userSettings");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ormConfig = {
    type: 'sqlite',
    database: process.env.DATABASE_URL || 'database.sqlite',
    synchronize: true,
    logging: false,
    entities: [user_1.User, usage_1.Usage, chatSession_1.ChatSession, chatMessage_1.ChatMessage, userSettings_1.UserSettings],
};
exports.default = ormConfig;
//# sourceMappingURL=ormconfig.js.map