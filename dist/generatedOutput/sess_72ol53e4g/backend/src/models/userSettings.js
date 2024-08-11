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
exports.UserSettings = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
let UserSettings = class UserSettings {
};
exports.UserSettings = UserSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_1.User),
    __metadata("design:type", user_1.User)
], UserSettings.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserSettings.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserSettings.prototype, "simplifiedAnswers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0.5 }),
    __metadata("design:type", Number)
], UserSettings.prototype, "creativityLevel", void 0);
exports.UserSettings = UserSettings = __decorate([
    (0, typeorm_1.Entity)()
], UserSettings);
