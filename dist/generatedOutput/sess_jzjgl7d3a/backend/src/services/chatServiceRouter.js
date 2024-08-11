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
exports.ChatServiceRouter = void 0;
class ChatServiceRouter {
    constructor(providerManager) {
        this.providerManager = providerManager;
    }
    routeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use some logic to determine which provider to use
            const providers = this.providerManager.getProviders();
            // Example: Always use the first provider for simplicity
            const provider = providers[0];
            if (!provider) {
                throw new Error('No providers available');
            }
            return provider.sendMessage(message);
        });
    }
}
exports.ChatServiceRouter = ChatServiceRouter;
