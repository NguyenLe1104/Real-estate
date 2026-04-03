import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
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
        return this.prisma.$transaction(async (tx) => {
            const activeVip = await tx.vipSubscription.findFirst({
                where: {
                    userId: userId,
                    status: 1, 
                    endDate: { gt: new Date() },
                },
            });

            const isVip = !!activeVip;
            const postStatus = isVip ? 1 : 0;

            const post = await tx.post.create({
                data: {
                    title: dto.title,
                    city: dto.city,
                    district: dto.district,
                    ward: dto.ward,
                    address: dto.address,
                    description: dto.description,
                    price: Number(dto.price),
                    area: Number(dto.area),
                    direction: dto.direction,
                    status: postStatus, 
                    isVip: isVip,
                    userId,
                },
            });

            if (files?.length) {
                const uploads = await this.cloudinaryService.uploadImages(files);
                await tx.postImage.createMany({
                    data: uploads.map((upload, index) => ({
                        url: upload.secure_url,
                        postId: post.id,
                        position: index + 1,
                    })),
                });
            }

            const createdPost = await tx.post.findUnique({
                where: { id: post.id },
                include: { images: { select: { id: true, url: true, position: true } } },
            });

            if (isVip) {
                return {
                    success: true,
                    requirePayment: false,
                    post: createdPost,
                    message: 'Đăng bài thành công. Bài viết đang chờ duyệt.',
                };
            } else {
                // ĐÃ FIX: Lấy danh sách gói VIP khả dụng để Frontend show ngay lập tức
                const availablePackages = await tx.vipPackage.findMany({
                    where: { status: 1 },
                    select: { id: true, name: true, price: true, durationDays: true }
                });

                return {
                    success: true,
                    requirePayment: true,
                    postId: post.id,
                    availablePackages: availablePackages, // Frontend dùng mảng này để render options
                    message: 'Vui lòng thanh toán phí đăng bài hoặc nâng cấp VIP.',
                };
            }
        });
    }

    async findAll(query: { page?: number; limit?: number; status?: number; search?: string }) {
        // ... (Giữ nguyên như cũ)
        const { page = 1, limit = 10, status, search } = query;
        const skip = (page - 1) * limit;
        const where: any = {};
        
        if (status !== undefined) {
            where.status = Number(status);
        } else {
            where.status = { not: 0 }; 
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                include: {
                    user: { select: { id: true, username: true, fullName: true, phone: true } },
                    images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
                },
                orderBy: { postedAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.post.count({ where }),
        ]);

        return { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total, data: posts };
    }

    async findApproved(page = 1, limit = 6) {
        // ... (Giữ nguyên như cũ)
        const skip = (page - 1) * limit;
        const now = new Date();

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { status: 2 },
                include: {
                    user: { select: { id: true, username: true, fullName: true, phone: true } },
                    images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
                    vipSubscriptions: {
                        where: { status: 1, endDate: { gte: now } },
                        include: { package: { select: { name: true, priorityLevel: true } } },
                        take: 1,
                    },
                },
                orderBy: [
                    { vipSubscriptions: { _count: 'desc' } },
                    { postedAt: 'desc' }
                ],
                skip,
                take: limit,
            }),
            this.prisma.post.count({ where: { status: 2 } }),
        ]);

        const formattedPosts = posts.map(post => {
            const vip = post.vipSubscriptions?.[0];
            return {
                ...post,
                isVip: !!vip,
                vipPackageName: vip?.package?.name || null,
                vipPriorityLevel: vip?.package?.priorityLevel || null,
                vipSubscriptions: undefined, 
            };
        });

        return { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, data: formattedPosts };
    }

    async findPending() {
        return this.prisma.post.findMany({
            where: { status: 1 },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
            },
            orderBy: { postedAt: 'desc' },
        });
    }

    async findById(id: number) {
        // ... (Giữ nguyên như cũ)
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, fullName: true, phone: true } },
                images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
            },
        });
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');
        return post;
    }

    async approve(id: number) {
        // ... (Giữ nguyên như cũ)
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { user: { select: { fullName: true, email: true } } },
        });
        if (!post) throw new NotFoundException('Bài đăng không tồn tại');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 2, approvedAt: new Date() },
        });

        if (post.user?.email) {
            const html = this.mailService.getPostApprovedEmailHtml(post.user.fullName || 'Quý khách', post.title);
            this.mailProducer.sendMail(post.user.email, 'Bài đăng đã được duyệt', html);
        }

        return { message: 'Đã duyệt bài đăng', data: updated };
    }

    async reject(id: number) {
         // ... (Giữ nguyên như cũ)
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: { user: { select: { fullName: true, email: true } } },
        });
        if (!post) throw new NotFoundException('Bài đăng không tồn tại');

        const updated = await this.prisma.post.update({
            where: { id },
            data: { status: 3, approvedAt: new Date() },
        });

        if (post.user?.email) {
            const html = this.mailService.getPostRejectedEmailHtml(post.user.fullName || 'Quý khách', post.title);
            this.mailProducer.sendMail(post.user.email, 'Bài đăng chưa được phê duyệt', html);
        }

        return { message: 'Đã từ chối bài đăng', data: updated };
    }

    async delete(id: number, userId: number) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Bài đăng không tồn tại');

        if (post.userId !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');
        }

        // ĐÃ FIX: await transaction xong mới return thông báo
        await this.prisma.$transaction(async (tx) => {
            await tx.postImage.deleteMany({ where: { postId: id } });
            await tx.post.delete({ where: { id } });
        });
        
        return { message: 'Xóa bài đăng thành công' };
    }

    async findByUser(userId: number) {
        return this.prisma.post.findMany({
            where: { userId },
            include: {
                images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
            },
            orderBy: { postedAt: 'desc' },
        });
    }

    async update(id: number, dto: UpdatePostDto, userId: number, files?: Express.Multer.File[]) {
        // ... (Giữ nguyên như cũ)
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');

        if (post.userId !== userId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài đăng này');
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedPost = await tx.post.update({
                where: { id },
                data: {
                    title: dto.title,
                    city: dto.city,
                    district: dto.district,
                    ward: dto.ward,
                    address: dto.address,
                    description: dto.description,
                    direction: dto.direction,
                    price: dto.price ? Number(dto.price) : undefined,
                    area: dto.area ? Number(dto.area) : undefined,
                },
            });

            if (files && files.length > 0) {
                await tx.postImage.deleteMany({ where: { postId: id } });

                const uploads = await this.cloudinaryService.uploadImages(files);
                await tx.postImage.createMany({
                    data: uploads.map((upload, index) => ({
                        url: upload.secure_url,
                        postId: id,
                        position: index + 1,
                    })),
                });
            }

            return tx.post.findUnique({
                where: { id },
                include: {
                    images: { select: { id: true, url: true, position: true }, orderBy: { position: 'asc' } },
                    user: { select: { id: true, username: true, fullName: true, phone: true } },
                },
            });
        });
    }
}