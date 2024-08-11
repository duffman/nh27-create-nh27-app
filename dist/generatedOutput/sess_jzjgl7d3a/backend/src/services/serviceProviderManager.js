"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceProviderManager = void 0;
class ServiceProviderManager {
    constructor() {
        this.providers = [];
    }
    static getInstance() {
        if (!ServiceProviderManager.instance) {
            ServiceProviderManager.instance = new ServiceProviderManager();
        }
        return ServiceProviderManager.instance;
    }
    registerProvider(provider) {
        this.providers.push(provider);
    }
    getProviders() {
        return this.providers;
    }
    getProviderByName(name) {
        return this.providers.find(provider => provider.name === name);
    }
}
exports.serviceProviderManager = ServiceProviderManager.getInstance();
