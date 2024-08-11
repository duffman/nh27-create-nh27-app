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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const database_1 = require("../database");
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const class_validator_1 = require("class-validator");
const jwt_1 = require("../utils/jwt");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const user = new user_1.User();
    user.username = username;
    user.email = email;
    user.password = yield bcryptjs_1.default.hash(password, 10);
    user.tokenBalance = 1000; // Initial token balance
    const errors = yield (0, class_validator_1.validate)(user);
    if (errors.length > 0) {
        return res.status(400).json(errors);
    }
    yield database_1.AppDataSource.manager.save(user);
    res.json(user);
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield database_1.AppDataSource.manager.findOneBy(user_1.User, { email });
    if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = (0, jwt_1.generateToken)(user.id);
    res.json({ token });
});
exports.login = login;
