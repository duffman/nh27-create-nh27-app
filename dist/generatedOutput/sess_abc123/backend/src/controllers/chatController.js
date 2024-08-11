"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.initiateChat = void 0;
const database_1 = require("../database");
const chatSession_1 = require("../models/chatSession");
const chatMessage_1 = require("../models/chatMessage");
const user_1 = require("../models/user");
const chatServiceRouter_1 = require("../services/chatServiceRouter");
const zod_1 = require("zod");
const tsyringe_1 = require("tsyringe");
const serviceRouter = tsyringe_1.container.resolve(chatServiceRouter_1.ChatServiceRouter);
const initiateChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const session = new chatSession_1.ChatSession();
    session.user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { id: userId });
    session.createdAt = new Date();
    session.messages = [];
    yield database_1.AppDataSource.manager.save(session);
    res.json(session);
});
exports.initiateChat = initiateChat;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = zod_1.z.object({
        sessionId: zod_1.z.number(),
        message: zod_1.z.string().min(1),
    });
    try {
        schema.parse(req.body);
    }
    catch (error) {
        return res.status(400).json(error.errors);
    }
    const { sessionId, message } = req.body;
    const userId = req.user.id;
    const user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { id: userId });
    const session = yield database_1.AppDataSource.manager.findOne(chatSession_1.ChatSession, {
        where: { id: sessionId },
        relations: ['messages'],
    });
    if (!session)
        return res.status(404).json({ message: 'Session not found' });
    if (session.user.id !== userId)
        return res.status(403).json({ message: 'Forbidden' });
    const response = yield serviceRouter.routeMessage(message, user.settings);
    const userMessage = new chatMessage_1.ChatMessage();
    userMessage.session = session;
    userMessage.sender = 'user';
    userMessage.message = message;
    userMessage.timestamp = new Date();
    yield database_1.AppDataSource.manager.save(userMessage);
    const botMessage = new chatMessage_1.ChatMessage();
    botMessage.session = session;
    botMessage.sender = 'bot';
    botMessage.message = response;
    botMessage.timestamp = new Date();
    yield database_1.AppDataSource.manager.save(botMessage);
    res.json({ session, response });
});
exports.sendMessage = sendMessage;
//# sourceMappingURL=chatController.js.map