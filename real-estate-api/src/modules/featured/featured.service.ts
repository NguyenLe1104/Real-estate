import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeaturedService {
    constructor(private prisma: PrismaService) { }

    async getFeaturedHouses(limit = 8) {
        // Get houses with most appointments
        const houses = await this.prisma.house.findMany({
            where: { status: 1 },
            include: {
                images: { select: { url: true } },
                _count: { select: { appointments: true } },
            },
            orderBy: { appointments: { _count: 'desc' } },
            take: limit,
        });

        return houses;
    }

    async getFeaturedLands(limit = 8) {
        const lands = await this.prisma.land.findMany({
            where: { status: 1 },
            include: {
                images: { select: { url: true } },
                _count: { select: { appointments: true } },
            },
            orderBy: { appointments: { _count: 'desc' } },
            take: limit,
        });

        return lands;
    }

    async getFeaturedProperties(limit = 8) {
        const [houses, lands] = await Promise.all([
            this.getFeaturedHouses(limit),
            this.getFeaturedLands(limit),
        ]);

        return { houses, lands };
    }
}
