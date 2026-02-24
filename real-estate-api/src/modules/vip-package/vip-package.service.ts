import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVipPackageDto, UpdateVipPackageDto } from './dto/vip-package.dto';

@Injectable()
export class VipPackageService {
    constructor(private prisma: PrismaService) { }

    // ==================== VIP PACKAGE MANAGEMENT ====================

    async createPackage(dto: CreateVipPackageDto) {
        const vipPackage = await this.prisma.vipPackage.create({
            data: {
                name: dto.name,
                description: dto.description,
                durationDays: dto.durationDays,
                price: dto.price,
                priorityLevel: dto.priorityLevel,
                features: dto.features,
            },
        });

        return {
            message: 'VIP package created successfully',
            data: vipPackage,
        };
    }

    async getAllPackages(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const packages = await this.prisma.vipPackage.findMany({
            where: { status: 1 },
            orderBy: { priorityLevel: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.vipPackage.count({
            where: { status: 1 },
        });

        return {
            data: packages,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPackageById(id: number) {
        const vipPackage = await this.prisma.vipPackage.findUnique({
            where: { id },
        });

        if (!vipPackage) {
            throw new NotFoundException('VIP package not found');
        }

        return { data: vipPackage };
    }

    async updatePackage(id: number, dto: UpdateVipPackageDto) {
        const vipPackage = await this.prisma.vipPackage.findUnique({
            where: { id },
        });

        if (!vipPackage) {
            throw new NotFoundException('VIP package not found');
        }

        const updated = await this.prisma.vipPackage.update({
            where: { id },
            data: dto,
        });

        return {
            message: 'VIP package updated successfully',
            data: updated,
        };
    }

    async deletePackage(id: number) {
        const vipPackage = await this.prisma.vipPackage.findUnique({
            where: { id },
        });

        if (!vipPackage) {
            throw new NotFoundException('VIP package not found');
        }

        // Soft delete
        await this.prisma.vipPackage.update({
            where: { id },
            data: { status: 0 },
        });

        return { message: 'VIP package deleted successfully' };
    }

    // ==================== VIP SUBSCRIPTION ====================

    async getMySubscriptions(userId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const subscriptions = await this.prisma.vipSubscription.findMany({
            where: { userId },
            include: {
                package: true,
                post: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        district: true,
                        status: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        paymentMethod: true,
                        status: true,
                        paidAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.vipSubscription.count({
            where: { userId },
        });

        return {
            data: subscriptions,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getSubscriptionById(id: number, userId: number) {
        const subscription = await this.prisma.vipSubscription.findFirst({
            where: { id, userId },
            include: {
                package: true,
                post: true,
                payment: true,
            },
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        return { data: subscription };
    }

    async cancelSubscription(id: number, userId: number) {
        const subscription = await this.prisma.vipSubscription.findFirst({
            where: { id, userId },
            include: { payment: true },
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        if (subscription.status === 1) {
            throw new BadRequestException('Cannot cancel active subscription');
        }

        if (subscription.payment && subscription.payment.status === 1) {
            throw new BadRequestException('Cannot cancel paid subscription');
        }

        await this.prisma.vipSubscription.update({
            where: { id },
            data: { status: 3 }, // cancelled
        });

        return { message: 'Subscription cancelled successfully' };
    }

    // ==================== ADMIN ====================

    async getAllSubscriptions(page = 1, limit = 10, status?: number) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status !== undefined) {
            where.status = status;
        }

        const subscriptions = await this.prisma.vipSubscription.findMany({
            where,
            include: {
                package: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        phone: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        district: true,
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await this.prisma.vipSubscription.count({ where });

        return {
            data: subscriptions,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
