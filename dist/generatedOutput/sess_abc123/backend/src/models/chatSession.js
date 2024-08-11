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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSession = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const chatMessage_1 = require("./chatMessage");
let ChatSession = class ChatSession {
};
exports.ChatSession = ChatSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User),
    __metadata("design:type", user_1.User)
], ChatSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ChatSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chatMessage_1.ChatMessage, message => message.session),
    __metadata("design:type", Array)
], ChatSession.prototype, "messages", void 0);
exports.ChatSession = ChatSession = __decorate([
    (0, typeorm_1.Entity)()
], ChatSession);
//# sourceMappingURL=chatSession.js.map