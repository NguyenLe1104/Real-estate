import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoriteService {
    constructor(private prisma: PrismaService) { }

    async findByUser(userId: number) {
        return this.prisma.favorite.findMany({
            where: { userId },
            include: {
                house: {
                    include: { images: { select: { id: true, url: true } } },
                },
                land: {
                    include: { images: { select: { id: true, url: true } } },
                },
            },
        });
    }

    async addHouse(userId: number, houseId: number) {
        const house = await this.prisma.house.findUnique({ where: { id: houseId } });
        if (!house) throw new NotFoundException('House not found');

        const existing = await this.prisma.favorite.findFirst({
            where: { userId, houseId },
        });
        if (existing) throw new BadRequestException('Already in favorites');

        const favorite = await this.prisma.favorite.create({
            data: { userId, houseId },
        });

        return { message: 'Added to favorites', data: favorite };
    }

    async addLand(userId: number, landId: number) {
        const land = await this.prisma.land.findUnique({ where: { id: landId } });
        if (!land) throw new NotFoundException('Land not found');

        const existing = await this.prisma.favorite.findFirst({
            where: { userId, landId },
        });
        if (existing) throw new BadRequestException('Already in favorites');

        const favorite = await this.prisma.favorite.create({
            data: { userId, landId },
        });

        return { message: 'Added to favorites', data: favorite };
    }

    async removeHouse(userId: number, houseId: number) {
        const fav = await this.prisma.favorite.findFirst({ where: { userId, houseId } });
        if (!fav) throw new NotFoundException('Favorite not found');

        await this.prisma.favorite.delete({ where: { id: fav.id } });
        return { message: 'Removed from favorites' };
    }

    async removeLand(userId: number, landId: number) {
        const fav = await this.prisma.favorite.findFirst({ where: { userId, landId } });
        if (!fav) throw new NotFoundException('Favorite not found');

        await this.prisma.favorite.delete({ where: { id: fav.id } });
        return { message: 'Removed from favorites' };
    }
}
