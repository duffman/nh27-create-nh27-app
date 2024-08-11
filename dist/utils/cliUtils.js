"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarning = exports.logSuccess = exports.logError = exports.logInfo = void 0;
const colors_1 = __importDefault(require("colors"));
const logInfo = (message) => {
    console.log(colors_1.default.blue(`[INFO] ${message}`));
};
exports.logInfo = logInfo;
const logError = (message) => {
    console.error(colors_1.default.red(`[ERROR] ${message}`));
};
exports.logError = logError;
const logSuccess = (message) => {
    console.log(colors_1.default.green(`[SUCCESS] ${message}`));
};
exports.logSuccess = logSuccess;
const logWarning = (message) => {
    console.log(colors_1.default.yellow(`[WARNING] ${message}`));
};
exports.logWarning = logWarning;
//# sourceMappingURL=cliUtils.js.map