import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/post.dto';

@Injectable()
export class PostService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    async create(dto: CreatePostDto, userId: number, files?: Express.Multer.File[]) {
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

    async findById(id: number) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true } },
            },
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async approve(id: number) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 2, approvedAt: new Date() },
        });

        return { message: 'Post approved', data: updated };
    }

    async reject(id: number) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Post not found');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 3, approvedAt: new Date() },
        });

        return { message: 'Post rejected', data: updated };
    }

    async delete(id: number) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!post) throw new NotFoundException('Post not found');

        if (post.images?.length) {
            await this.prisma.postImage.deleteMany({ where: { postId: id } });
        }

        await this.prisma.post.delete({ where: { id } });
        return { message: 'Post deleted successfully' };
    }

    async findByUser(userId: number) {
        return this.prisma.post.findMany({
            where: { userId },
            include: {
                images: { select: { id: true, url: true, position: true } },
            },
            orderBy: { postedAt: 'desc' },
        });
    }
}
