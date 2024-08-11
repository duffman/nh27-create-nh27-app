"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.OpenAiServiceProvider = void 0;
const tsyringe_1 = require("tsyringe");
const axios_1 = __importDefault(require("axios"));
let OpenAiServiceProvider = class OpenAiServiceProvider {
    constructor() {
        this.name = 'OpenAI';
    }
    calculateCost(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement cost calculation logic, possibly calling OpenAI API
            return Math.ceil(message.length / 100); // Example: 1 token per 100 characters
        });
    }
    sendMessage(message, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement the API call to OpenAI
            const response = yield axios_1.default.post('https://api.openai.com/v1/chat', {
                message,
                settings
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            });
            return response.data.message;
        });
    }
};
exports.OpenAiServiceProvider = OpenAiServiceProvider;
exports.OpenAiServiceProvider = OpenAiServiceProvider = __decorate([
    (0, tsyringe_1.injectable)()
], OpenAiServiceProvider);
//# sourceMappingURL=openAiServiceProvider.js.map