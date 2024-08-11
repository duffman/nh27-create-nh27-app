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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = require("./database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const usageRoutes_1 = __importDefault(require("./routes/usageRoutes"));
const serviceProviderManager_1 = require("./services/serviceProviderManager");
const openAiServiceProvider_1 = require("./services/openAiServiceProvider");
database_1.AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    // Register service providers
    serviceProviderManager_1.serviceProviderManager.registerProvider(new openAiServiceProvider_1.OpenAiServiceProvider());
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
    app.use('/api', authRoutes_1.default);
    app.use('/api', chatRoutes_1.default);
    app.use('/api', userRoutes_1.default);
    app.use('/api', usageRoutes_1.default);
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}))
    .catch((error) => console.log(error));
