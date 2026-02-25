import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateLandDto, UpdateLandDto } from './dto/land.dto';
import { validateFieldsNoSpecialChars } from '../../common/utils/validators';

@Injectable()
export class LandService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

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

    async findById(id: number) {
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
        if (!land) throw new NotFoundException('Land not found');
        return land;
    }

    async create(dto: CreateLandDto, files?: Express.Multer.File[]) {
        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.plotNumber, dto.direction];
        if (validateFieldsNoSpecialChars(fieldsToCheck)) {
            throw new BadRequestException('Fields contain special characters');
        }

        const existing = await this.prisma.land.findUnique({ where: { code: dto.code } });
        if (existing) throw new BadRequestException('Land code already exists');

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
                area: dto.area ? parseFloat(dto.area as any) : null,
                direction: dto.direction,
                frontWidth: dto.frontWidth ? parseFloat(dto.frontWidth as any) : null,
                landLength: dto.landLength ? parseFloat(dto.landLength as any) : null,
                landType: dto.landType,
                legalStatus: dto.legalStatus,
                status: 1,
                categoryId: dto.categoryId ? parseInt(dto.categoryId as any) : null,
                employeeId: dto.employeeId ? parseInt(dto.employeeId as any) : null,
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

    async update(id: number, dto: UpdateLandDto, files?: Express.Multer.File[]) {
        const land = await this.prisma.land.findUnique({ where: { id } });
        if (!land) throw new NotFoundException('Land not found');

        if (dto.code) {
            const existing = await this.prisma.land.findUnique({ where: { code: dto.code } });
            if (existing && existing.id !== id) throw new BadRequestException('Land code already exists');
        }

        const fieldsToCheck = [dto.code, dto.title, dto.city, dto.district, dto.ward, dto.street, dto.plotNumber, dto.direction];
        if (validateFieldsNoSpecialChars(fieldsToCheck)) {
            throw new BadRequestException('Fields contain special characters');
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
                ...(dto.area !== undefined && { area: parseFloat(dto.area as any) }),
                ...(dto.direction !== undefined && { direction: dto.direction }),
                ...(dto.frontWidth !== undefined && { frontWidth: parseFloat(dto.frontWidth as any) }),
                ...(dto.landLength !== undefined && { landLength: parseFloat(dto.landLength as any) }),
                ...(dto.landType !== undefined && { landType: dto.landType }),
                ...(dto.legalStatus !== undefined && { legalStatus: dto.legalStatus }),
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId ? parseInt(dto.categoryId as any) : null }),
                ...(dto.employeeId !== undefined && { employeeId: dto.employeeId ? parseInt(dto.employeeId as any) : null }),
            },
        });

        if (files?.length || dto.keepImageIds !== undefined) {
            // Parse danh sách ID ảnh cần giữ
            const keepIds: number[] = dto.keepImageIds
                ? (Array.isArray(dto.keepImageIds) ? dto.keepImageIds : [dto.keepImageIds])
                    .map(Number).filter((n) => !isNaN(n))
                : [];

            // Xóa ảnh không nằm trong keepIds
            await this.prisma.landImage.deleteMany({
                where: {
                    landId: id,
                    ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
                },
            });

            // Upload và thêm ảnh mới
            if (files?.length) {
                const existingCount = await this.prisma.landImage.count({ where: { landId: id } });
                const uploads = await this.cloudinaryService.uploadImages(files);
                await this.prisma.landImage.createMany({
                    data: uploads.map((upload, index) => ({
                        url: upload.secure_url,
                        landId: id,
                        position: existingCount + index + 1,
                    })),
                });
            }
        }

        return {
            message: 'Land updated successfully',
            data: await this.findById(id),
        };
    }

    async delete(id: number) {
        const land = await this.prisma.land.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!land) throw new NotFoundException('Land not found');

        for (const img of land.images) {
            const publicId = img.url.split('/').pop()?.split('.')[0];
            if (publicId) await this.cloudinaryService.deleteImage(publicId);
        }

        await this.prisma.landImage.deleteMany({ where: { landId: id } });
        await this.prisma.land.delete({ where: { id } });

        return { message: 'Land deleted successfully' };
    }

    async search(query: string, page = 1, limit = 10) {
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
}
