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
exports.FeaturedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FeaturedService = class FeaturedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFeaturedHouses(limit = 8) {
        const houses = await this.prisma.house.findMany({
            where: { status: 1 },
            include: {
                images: { select: { url: true } },
                _count: { select: { appointments: true } },
            },
            orderBy: { appointments: { _count: 'desc' } },
            take: limit,
        });
        return houses;
    }
    async getFeaturedLands(limit = 8) {
        const lands = await this.prisma.land.findMany({
            where: { status: 1 },
            include: {
                images: { select: { url: true } },
                _count: { select: { appointments: true } },
            },
            orderBy: { appointments: { _count: 'desc' } },
            take: limit,
        });
        return lands;
    }
    async getFeaturedProperties(limit = 8) {
        const [houses, lands] = await Promise.all([
            this.getFeaturedHouses(limit),
            this.getFeaturedLands(limit),
        ]);
        return { houses, lands };
    }
};
exports.FeaturedService = FeaturedService;
exports.FeaturedService = FeaturedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeaturedService);
//# sourceMappingURL=featured.service.js.map