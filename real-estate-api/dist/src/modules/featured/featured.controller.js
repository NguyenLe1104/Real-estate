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
exports.FeaturedController = void 0;
const common_1 = require("@nestjs/common");
const featured_service_1 = require("./featured.service");
let FeaturedController = class FeaturedController {
    featuredService;
    constructor(featuredService) {
        this.featuredService = featuredService;
    }
    getFeatured(limit = 8) {
        return this.featuredService.getFeaturedProperties(+limit);
    }
    getFeaturedHouses(limit = 8) {
        return this.featuredService.getFeaturedHouses(+limit);
    }
    getFeaturedLands(limit = 8) {
        return this.featuredService.getFeaturedLands(+limit);
    }
};
exports.FeaturedController = FeaturedController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeaturedController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('houses'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeaturedController.prototype, "getFeaturedHouses", null);
__decorate([
    (0, common_1.Get)('lands'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeaturedController.prototype, "getFeaturedLands", null);
exports.FeaturedController = FeaturedController = __decorate([
    (0, common_1.Controller)('featured'),
    __metadata("design:paramtypes", [featured_service_1.FeaturedService])
], FeaturedController);
//# sourceMappingURL=featured.controller.js.map