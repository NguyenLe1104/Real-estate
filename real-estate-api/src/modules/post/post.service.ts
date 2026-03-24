import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/post.dto';
import { MailProducerService } from '../../common/mail/mail-producer.service';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class PostService {
    constructor(
        private prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
        private mailProducer: MailProducerService,
        private mailService: MailService,
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

    // ✅ LIST THƯỜNG (KHÔNG CHỨA VIP)
    async findApproved(page = 1, limit = 6) {
        const skip = (page - 1) * limit;
        const now = new Date();

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { status: 2 },
                include: {
                    user: { select: { id: true, username: true, fullName: true, phone: true } },
                    images: { select: { id: true, url: true, position: true } },
                },
                orderBy: { postedAt: 'desc' },
            }),
            this.prisma.post.count({ where: { status: 2 } }),
        ]);

        const mappedPosts = posts.map(post => {
            const isVip =
                post.isVip === true &&   // ✅ boolean rồi, KHÔNG so sánh với 1
                (!post.vipExpiry || new Date(post.vipExpiry) > now);

            return {
                ...post,
                isVip,
            };
        });

        const sortedPosts = mappedPosts.sort((a, b) => {
            if (a.isVip && !b.isVip) return -1;
            if (!a.isVip && b.isVip) return 1;
            return 0;
        });

        const paginatedPosts = sortedPosts.slice(skip, skip + limit);

        return {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data: paginatedPosts,
        };
    }

    // ✅ LIST VIP
    async findVip() {
        const posts = await this.prisma.post.findMany({
            where: {
                status: 2,
                isVip: true, // ✅ đúng field
            },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true } },
            },
            orderBy: { postedAt: 'desc' },
        });

        return posts.map(post => ({
            ...post,
            isVip: true, // luôn VIP
        }));
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
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { user: { select: { fullName: true, email: true } } },
        });
        if (!post) throw new NotFoundException('Post not found');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 2, approvedAt: new Date() },
        });

        if (post.user?.email) {
            const html = this.mailService.getPostApprovedEmailHtml(
                post.user.fullName || 'Quý khách',
                post.title,
            );
            this.mailProducer.sendMail(post.user.email, 'Bài đăng đã được duyệt', html);
        }

        return { message: 'Post approved', data: updated };
    }

    async reject(id: number) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { user: { select: { fullName: true, email: true } } },
        });
        if (!post) throw new NotFoundException('Post not found');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 3, approvedAt: new Date() },
        });

        if (post.user?.email) {
            const html = this.mailService.getPostRejectedEmailHtml(
                post.user.fullName || 'Quý khách',
                post.title,
            );
            this.mailProducer.sendMail(post.user.email, 'Bài đăng chưa được duyệt', html);
        }

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