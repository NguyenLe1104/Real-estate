import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, username: true, fullName: true, phone: true, email: true, address: true, status: true },
                    },
                },
            }),
            this.prisma.customer.count(),
        ]);

        return {
            data: customers,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }

    async findById(id: number) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, username: true, fullName: true, phone: true, email: true, address: true, status: true },
                },
            },
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }
}
