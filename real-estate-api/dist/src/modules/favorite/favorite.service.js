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
exports.FavoriteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FavoriteService = class FavoriteService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByUser(userId) {
        return this.prisma.favorite.findMany({
            where: { userId },
            include: {
                house: {
                    include: { images: { select: { id: true, url: true } } },
                },
                land: {
                    include: { images: { select: { id: true, url: true } } },
                },
            },
        });
    }
    async addHouse(userId, houseId) {
        const house = await this.prisma.house.findUnique({ where: { id: houseId } });
        if (!house)
            throw new common_1.NotFoundException('House not found');
        const existing = await this.prisma.favorite.findFirst({
            where: { userId, houseId },
        });
        if (existing)
            throw new common_1.BadRequestException('Already in favorites');
        const favorite = await this.prisma.favorite.create({
            data: { userId, houseId },
        });
        return { message: 'Added to favorites', data: favorite };
    }
    async addLand(userId, landId) {
        const land = await this.prisma.land.findUnique({ where: { id: landId } });
        if (!land)
            throw new common_1.NotFoundException('Land not found');
        const existing = await this.prisma.favorite.findFirst({
            where: { userId, landId },
        });
        if (existing)
            throw new common_1.BadRequestException('Already in favorites');
        const favorite = await this.prisma.favorite.create({
            data: { userId, landId },
        });
        return { message: 'Added to favorites', data: favorite };
    }
    async removeHouse(userId, houseId) {
        const fav = await this.prisma.favorite.findFirst({ where: { userId, houseId } });
        if (!fav)
            throw new common_1.NotFoundException('Favorite not found');
        await this.prisma.favorite.delete({ where: { id: fav.id } });
        return { message: 'Removed from favorites' };
    }
    async removeLand(userId, landId) {
        const fav = await this.prisma.favorite.findFirst({ where: { userId, landId } });
        if (!fav)
            throw new common_1.NotFoundException('Favorite not found');
        await this.prisma.favorite.delete({ where: { id: fav.id } });
        return { message: 'Removed from favorites' };
    }
};
exports.FavoriteService = FavoriteService;
exports.FavoriteService = FavoriteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoriteService);
//# sourceMappingURL=favorite.service.js.map