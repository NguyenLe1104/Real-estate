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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("../../common/cloudinary/cloudinary.service");
let PostService = class PostService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async create(dto, userId, files) {
        const post = await this.prisma.post.create({
            data: {
                title: dto.title,
                city: dto.city,
                district: dto.district,
                ward: dto.ward,
                address: dto.address,
                description: dto.description,
                price: dto.price,
                area: dto.area,
                direction: dto.direction,
                status: 1,
                userId,
            },
        });
        if (files?.length) {
            const uploads = await this.cloudinaryService.uploadImages(files);
            await this.prisma.postImage.createMany({
                data: uploads.map((upload, index) => ({
                    url: upload.secure_url,
                    postId: post.id,
                    position: index + 1,
                })),
            });
        }
        const fullPost = await this.prisma.post.findUnique({
            where: { id: post.id },
            include: { images: { select: { id: true, url: true, position: true } } },
        });
        return { message: 'Post created and pending approval', data: fullPost };
    }
    async findApproved(page = 1, limit = 6) {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { status: 2 },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, username: true, fullName: true, phone: true } },
                    images: { select: { id: true, url: true, position: true } },
                },
                orderBy: { postedAt: 'desc' },
            }),
            this.prisma.post.count({ where: { status: 2 } }),
        ]);
        return {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data: posts,
        };
    }
    async findPending() {
        return this.prisma.post.findMany({
            where: { status: 1 },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true } },
            },
        });
    }
    async findAll() {
        return this.prisma.post.findMany({
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true } },
            },
            orderBy: { status: 'asc' },
        });
    }
    async findById(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true } },
            },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async approve(id) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 2, approvedAt: new Date() },
        });
        return { message: 'Post approved', data: updated };
    }
    async reject(id) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 3, approvedAt: new Date() },
        });
        return { message: 'Post rejected', data: updated };
    }
    async delete(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.images?.length) {
            await this.prisma.postImage.deleteMany({ where: { postId: id } });
        }
        await this.prisma.post.delete({ where: { id } });
        return { message: 'Post deleted successfully' };
    }
    async findByUser(userId) {
        return this.prisma.post.findMany({
            where: { userId },
            include: {
                images: { select: { id: true, url: true, position: true } },
            },
            orderBy: { postedAt: 'desc' },
        });
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], PostService);
//# sourceMappingURL=post.service.js.map