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
exports.LandService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../../common/cloudinary/cloudinary.service");
const validators_1 = require("../../common/utils/validators");
let LandService = class LandService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [lands, total] = await Promise.all([
            this.prisma.land.findMany({
                skip,
                take: limit,
                include: {
                    category: true,
                    images: { select: { id: true, url: true } },
                    employee: {
                        include: { user: { select: { id: true, fullName: true, phone: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.land.count(),
        ]);
        return {
            data: lands,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
    async findById(id) {
        const land = await this.prisma.land.findUnique({
            where: { id },
            include: {
                category: true,
                images: { select: { id: true, url: true } },
                employee: {
                    include: { user: { select: { id: true, fullName: true, phone: true } } },
                },
            },
        });
        if (!land)
            throw new common_1.NotFoundException('Land not found');
        return land;
    }
    async create(dto, files) {
        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.plotNumber, dto.direction];
        if ((0, validators_1.validateFieldsNoSpecialChars)(fieldsToCheck)) {
            throw new common_1.BadRequestException('Fields contain special characters');
        }
        const existing = await this.prisma.land.findUnique({ where: { code: dto.code } });
        if (existing)
            throw new common_1.BadRequestException('Land code already exists');
        const land = await this.prisma.land.create({
            data: {
                code: dto.code,
                title: dto.title,
                city: dto.city,
                district: dto.district,
                ward: dto.ward,
                street: dto.street,
                plotNumber: dto.plotNumber,
                description: dto.description,
                price: dto.price,
                area: dto.area ? parseFloat(dto.area) : null,
                direction: dto.direction,
                frontWidth: dto.frontWidth ? parseFloat(dto.frontWidth) : null,
                landLength: dto.landLength ? parseFloat(dto.landLength) : null,
                landType: dto.landType,
                legalStatus: dto.legalStatus,
                status: 1,
                categoryId: dto.categoryId ? parseInt(dto.categoryId) : null,
                employeeId: dto.employeeId ? parseInt(dto.employeeId) : null,
            },
        });
        if (files?.length) {
            const uploads = await this.cloudinaryService.uploadImages(files);
            await this.prisma.landImage.createMany({
                data: uploads.map((upload, index) => ({
                    url: upload.secure_url,
                    landId: land.id,
                    position: index + 1,
                })),
            });
        }
        return {
            message: 'Land created successfully',
            data: await this.findById(land.id),
        };
    }
    async update(id, dto, files) {
        const land = await this.prisma.land.findUnique({ where: { id } });
        if (!land)
            throw new common_1.NotFoundException('Land not found');
        if (dto.code) {
            const existing = await this.prisma.land.findUnique({ where: { code: dto.code } });
            if (existing && existing.id !== id)
                throw new common_1.BadRequestException('Land code already exists');
        }
        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.plotNumber, dto.direction];
        if ((0, validators_1.validateFieldsNoSpecialChars)(fieldsToCheck)) {
            throw new common_1.BadRequestException('Fields contain special characters');
        }
        await this.prisma.land.update({
            where: { id },
            data: {
                ...(dto.code && { code: dto.code }),
                ...(dto.title && { title: dto.title }),
                ...(dto.city !== undefined && { city: dto.city }),
                ...(dto.district !== undefined && { district: dto.district }),
                ...(dto.ward !== undefined && { ward: dto.ward }),
                ...(dto.street !== undefined && { street: dto.street }),
                ...(dto.plotNumber !== undefined && { plotNumber: dto.plotNumber }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.area !== undefined && { area: parseFloat(dto.area) }),
                ...(dto.direction !== undefined && { direction: dto.direction }),
                ...(dto.frontWidth !== undefined && { frontWidth: parseFloat(dto.frontWidth) }),
                ...(dto.landLength !== undefined && { landLength: parseFloat(dto.landLength) }),
                ...(dto.landType !== undefined && { landType: dto.landType }),
                ...(dto.legalStatus !== undefined && { legalStatus: dto.legalStatus }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId ? parseInt(dto.categoryId) : null }),
                ...(dto.employeeId !== undefined && { employeeId: dto.employeeId ? parseInt(dto.employeeId) : null }),
            },
        });
        if (files?.length) {
            await this.prisma.landImage.deleteMany({ where: { landId: id } });
            const uploads = await this.cloudinaryService.uploadImages(files);
            await this.prisma.landImage.createMany({
                data: uploads.map((upload, index) => ({
                    url: upload.secure_url,
                    landId: id,
                    position: index + 1,
                })),
            });
        }
        return {
            message: 'Land updated successfully',
            data: await this.findById(id),
        };
    }
    async delete(id) {
        const land = await this.prisma.land.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!land)
            throw new common_1.NotFoundException('Land not found');
        for (const img of land.images) {
            const publicId = img.url.split('/').pop()?.split('.')[0];
            if (publicId)
                await this.cloudinaryService.deleteImage(publicId);
        }
        await this.prisma.landImage.deleteMany({ where: { landId: id } });
        await this.prisma.land.delete({ where: { id } });
        return { message: 'Land deleted successfully' };
    }
    async search(query, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { title: { contains: query } },
                { city: { contains: query } },
                { district: { contains: query } },
                { ward: { contains: query } },
                { description: { contains: query } },
            ],
        };
        const [lands, total] = await Promise.all([
            this.prisma.land.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true,
                    images: { select: { url: true } },
                },
            }),
            this.prisma.land.count({ where }),
        ]);
        return {
            data: lands,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
};
exports.LandService = LandService;
exports.LandService = LandService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], LandService);
//# sourceMappingURL=land.service.js.map