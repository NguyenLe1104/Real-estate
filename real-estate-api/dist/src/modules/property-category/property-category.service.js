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
exports.PropertyCategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PropertyCategoryService = class PropertyCategoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.propertyCategory.findMany();
    }
    async findById(id) {
        const category = await this.prisma.propertyCategory.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Property category not found');
        return category;
    }
    async create(dto) {
        const existing = await this.prisma.propertyCategory.findUnique({ where: { code: dto.code } });
        if (existing)
            throw new common_1.BadRequestException('Category code already exists');
        return this.prisma.propertyCategory.create({ data: dto });
    }
    async update(id, dto) {
        const category = await this.prisma.propertyCategory.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Property category not found');
        return this.prisma.propertyCategory.update({ where: { id }, data: dto });
    }
    async delete(id) {
        const category = await this.prisma.propertyCategory.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Property category not found');
        await this.prisma.propertyCategory.delete({ where: { id } });
        return { message: 'Property category deleted successfully' };
    }
};
exports.PropertyCategoryService = PropertyCategoryService;
exports.PropertyCategoryService = PropertyCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertyCategoryService);
//# sourceMappingURL=property-category.service.js.map