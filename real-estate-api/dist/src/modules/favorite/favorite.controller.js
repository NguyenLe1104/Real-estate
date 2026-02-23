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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const favorite_service_1 = require("./favorite.service");
let FavoriteController = class FavoriteController {
    favoriteService;
    constructor(favoriteService) {
        this.favoriteService = favoriteService;
    }
    findByUser(req) {
        return this.favoriteService.findByUser(req.user.id);
    }
    addHouse(houseId, req) {
        return this.favoriteService.addHouse(req.user.id, houseId);
    }
    addLand(landId, req) {
        return this.favoriteService.addLand(req.user.id, landId);
    }
    removeHouse(houseId, req) {
        return this.favoriteService.removeHouse(req.user.id, houseId);
    }
    removeLand(landId, req) {
        return this.favoriteService.removeLand(req.user.id, landId);
    }
};
exports.FavoriteController = FavoriteController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FavoriteController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)('house/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], FavoriteController.prototype, "addHouse", null);
__decorate([
    (0, common_1.Post)('land/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], FavoriteController.prototype, "addLand", null);
__decorate([
    (0, common_1.Delete)('house/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], FavoriteController.prototype, "removeHouse", null);
__decorate([
    (0, common_1.Delete)('land/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], FavoriteController.prototype, "removeLand", null);
exports.FavoriteController = FavoriteController = __decorate([
    (0, common_1.Controller)('favorites'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [favorite_service_1.FavoriteService])
], FavoriteController);
//# sourceMappingURL=favorite.controller.js.map