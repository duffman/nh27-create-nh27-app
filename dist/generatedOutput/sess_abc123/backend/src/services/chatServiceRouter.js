"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServiceRouter = void 0;
const tsyringe_1 = require("tsyringe");
const serviceProviderManager_1 = require("./serviceProviderManager");
let ChatServiceRouter = class ChatServiceRouter {
    constructor(providerManager) {
        this.providerManager = providerManager;
    }
    routeMessage(message, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use settings to determine which provider to use
            const providers = this.providerManager.getProviders();
            // Example: Always use the first provider for simplicity
            const provider = providers[0];
            if (!provider) {
                throw new Error('No providers available');
            }
            // Pass settings to provider
            return provider.sendMessage(message, settings);
        });
    }
};
exports.ChatServiceRouter = ChatServiceRouter;
exports.ChatServiceRouter = ChatServiceRouter = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [serviceProviderManager_1.ServiceProviderManager])
], ChatServiceRouter);
//# sourceMappingURL=chatServiceRouter.js.map