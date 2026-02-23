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
exports.HouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../../common/cloudinary/cloudinary.service");
const validators_1 = require("../../common/utils/validators");
let HouseService = class HouseService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [houses, total] = await Promise.all([
            this.prisma.house.findMany({
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
            this.prisma.house.count(),
        ]);
        return {
            data: houses,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
    async findById(id) {
        const house = await this.prisma.house.findUnique({
            where: { id },
            include: {
                category: true,
                images: { select: { id: true, url: true } },
                employee: {
                    include: { user: { select: { id: true, fullName: true, phone: true } } },
                },
            },
        });
        if (!house)
            throw new common_1.NotFoundException('House not found');
        return house;
    }
    async create(dto, files) {
        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.houseNumber, dto.direction];
        if ((0, validators_1.validateFieldsNoSpecialChars)(fieldsToCheck)) {
            throw new common_1.BadRequestException('Fields contain special characters');
        }
        const existing = await this.prisma.house.findUnique({ where: { code: dto.code } });
        if (existing)
            throw new common_1.BadRequestException('House code already exists');
        const house = await this.prisma.house.create({
            data: {
                code: dto.code,
                title: dto.title,
                city: dto.city,
                district: dto.district,
                ward: dto.ward,
                street: dto.street,
                houseNumber: dto.houseNumber,
                description: dto.description,
                price: dto.price,
                area: dto.area ? parseFloat(dto.area) : null,
                direction: dto.direction,
                floors: dto.floors ? parseInt(dto.floors) : 1,
                bedrooms: dto.bedrooms ? parseInt(dto.bedrooms) : 0,
                bathrooms: dto.bathrooms ? parseInt(dto.bathrooms) : 0,
                status: 1,
                categoryId: dto.categoryId ? parseInt(dto.categoryId) : null,
                employeeId: dto.employeeId ? parseInt(dto.employeeId) : null,
            },
        });
        if (files?.length) {
            const uploads = await this.cloudinaryService.uploadImages(files);
            await this.prisma.houseImage.createMany({
                data: uploads.map((upload, index) => ({
                    url: upload.secure_url,
                    houseId: house.id,
                    position: index + 1,
                })),
            });
        }
        return {
            message: 'House created successfully',
            data: await this.findById(house.id),
        };
    }
    async update(id, dto, files) {
        const house = await this.prisma.house.findUnique({ where: { id } });
        if (!house)
            throw new common_1.NotFoundException('House not found');
        if (dto.code) {
            const existing = await this.prisma.house.findUnique({ where: { code: dto.code } });
            if (existing && existing.id !== id)
                throw new common_1.BadRequestException('House code already exists');
        }
        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.houseNumber, dto.direction];
        if ((0, validators_1.validateFieldsNoSpecialChars)(fieldsToCheck)) {
            throw new common_1.BadRequestException('Fields contain special characters');
        }
        await this.prisma.house.update({
            where: { id },
            data: {
                ...(dto.code && { code: dto.code }),
                ...(dto.title && { title: dto.title }),
                ...(dto.city !== undefined && { city: dto.city }),
                ...(dto.district !== undefined && { district: dto.district }),
                ...(dto.ward !== undefined && { ward: dto.ward }),
                ...(dto.street !== undefined && { street: dto.street }),
                ...(dto.houseNumber !== undefined && { houseNumber: dto.houseNumber }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.area !== undefined && { area: parseFloat(dto.area) }),
                ...(dto.direction !== undefined && { direction: dto.direction }),
                ...(dto.floors !== undefined && { floors: parseInt(dto.floors) }),
                ...(dto.bedrooms !== undefined && { bedrooms: parseInt(dto.bedrooms) }),
                ...(dto.bathrooms !== undefined && { bathrooms: parseInt(dto.bathrooms) }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId ? parseInt(dto.categoryId) : null }),
                ...(dto.employeeId !== undefined && { employeeId: dto.employeeId ? parseInt(dto.employeeId) : null }),
            },
        });
        if (files?.length) {
            await this.prisma.houseImage.deleteMany({ where: { houseId: id } });
            const uploads = await this.cloudinaryService.uploadImages(files);
            await this.prisma.houseImage.createMany({
                data: uploads.map((upload, index) => ({
                    url: upload.secure_url,
                    houseId: id,
                    position: index + 1,
                })),
            });
        }
        return {
            message: 'House updated successfully',
            data: await this.findById(id),
        };
    }
    async delete(id) {
        const house = await this.prisma.house.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!house)
            throw new common_1.NotFoundException('House not found');
        for (const img of house.images) {
            const publicId = img.url.split('/').pop()?.split('.')[0];
            if (publicId)
                await this.cloudinaryService.deleteImage(publicId);
        }
        await this.prisma.houseImage.deleteMany({ where: { houseId: id } });
        await this.prisma.house.delete({ where: { id } });
        return { message: 'House deleted successfully' };
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
        const [houses, total] = await Promise.all([
            this.prisma.house.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true,
                    images: { select: { url: true } },
                },
            }),
            this.prisma.house.count({ where }),
        ]);
        return {
            data: houses,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
};
exports.HouseService = HouseService;
exports.HouseService = HouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], HouseService);
//# sourceMappingURL=house.service.js.map