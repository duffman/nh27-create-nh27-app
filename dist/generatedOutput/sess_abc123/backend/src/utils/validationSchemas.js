"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessageSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.chatMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.number().min(1, 'Session ID is required'),
    message: zod_1.z.string().min(1, 'Message is required'),
});
//# sourceMappingURL=validationSchemas.js.map