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
exports.getUserUsage = exports.logUsage = void 0;
const database_1 = require("../database");
const usage_1 = require("../models/usage");
const user_1 = require("../models/user");
const zod_1 = require("zod");
const logUsage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = zod_1.z.object({
        userId: zod_1.z.number(),
        model: zod_1.z.string(),
        tokensUsed: zod_1.z.number(),
    });
    try {
        schema.parse(req.body);
    }
    catch (error) {
        return res.status(400).json(error.errors);
    }
    const { userId, model, tokensUsed } = req.body;
    const user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { id: userId });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    if (user.tokenBalance < tokensUsed) {
        return res.status(400).json({ message: 'Insufficient tokens' });
    }
    user.tokenBalance -= tokensUsed;
    yield database_1.AppDataSource.manager.save(user);
    const usage = new usage_1.Usage();
    usage.user = user;
    usage.model = model;
    usage.tokensUsed = tokensUsed;
    usage.timestamp = new Date();
    yield database_1.AppDataSource.manager.save(usage);
    res.json(usage);
});
exports.logUsage = logUsage;
const getUserUsage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.id);
    const usage = yield database_1.AppDataSource.manager.find(usage_1.Usage, { where: { user: { id: userId } } });
    res.json(usage);
});
exports.getUserUsage = getUserUsage;
