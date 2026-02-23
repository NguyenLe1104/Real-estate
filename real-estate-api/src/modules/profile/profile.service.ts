import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
                email: true,
                address: true,
                status: true,
                createdAt: true,
                userRoles: { include: { role: { select: { code: true, name: true } } } },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.fullName !== undefined && { fullName: dto.fullName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.address !== undefined && { address: dto.address }),
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
                email: true,
                address: true,
            },
        });

        return { message: 'Profile updated successfully', data: updated };
    }

    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const isValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isValid) throw new BadRequestException('Current password is incorrect');

        const hashPass = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashPass } });

        return { message: 'Password changed successfully' };
    }
}
