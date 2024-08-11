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
exports.updateUserSettings = exports.getUser = void 0;
const database_1 = require("../database");
const user_1 = require("../models/user");
const userSettings_1 = require("../models/userSettings");
const zod_1 = require("zod");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { id: Number(req.params.id) });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    res.json(user);
});
exports.getUser = getUser;
const updateUserSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = zod_1.z.object({
        language: zod_1.z.string().optional(),
        simplifiedAnswers: zod_1.z.boolean().optional(),
        creativityLevel: zod_1.z.number().min(0).max(1).optional()
    });
    try {
        schema.parse(req.body);
    }
    catch (error) {
        return res.status(400).json(error.errors);
    }
    const userId = req.user.id;
    const user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { id: userId });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    let settings = yield database_1.AppDataSource.manager.findOneBy(userSettings_1.UserSettings, { user: { id: userId } });
    if (!settings) {
        settings = new userSettings_1.UserSettings();
        settings.user = user;
    }
    const { language, simplifiedAnswers, creativityLevel } = req.body;
    if (language !== undefined)
        settings.language = language;
    if (simplifiedAnswers !== undefined)
        settings.simplifiedAnswers = simplifiedAnswers;
    if (creativityLevel !== undefined)
        settings.creativityLevel = creativityLevel;
    yield database_1.AppDataSource.manager.save(settings);
    res.json(settings);
});
exports.updateUserSettings = updateUserSettings;
