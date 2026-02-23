import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, username: true, fullName: true, phone: true, email: true, status: true },
                    },
                },
            }),
            this.prisma.employee.count(),
        ]);

        return {
            data: employees,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }

    async findById(id: number) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, username: true, fullName: true, phone: true, email: true, status: true },
                },
            },
        });
        if (!employee) throw new NotFoundException('Employee not found');
        return employee;
    }

    async create(dto: CreateEmployeeDto) {
        // Create user first
        const existUser = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existUser) throw new BadRequestException('Username already exists');

        const hashPass = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashPass,
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                status: 1,
            },
        });

        // Assign EMPLOYEE role
        const empRole = await this.prisma.role.findUnique({ where: { code: 'EMPLOYEE' } });
        if (empRole) {
            await this.prisma.userRole.create({ data: { userId: user.id, roleId: empRole.id } });
        }

        const employee = await this.prisma.employee.create({
            data: {
                code: dto.code,
                startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
                userId: user.id,
            },
            include: { user: { select: { id: true, username: true, fullName: true, phone: true, email: true } } },
        });

        return { message: 'Employee created successfully', data: employee };
    }

    async update(id: number, dto: UpdateEmployeeDto) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) throw new NotFoundException('Employee not found');

        // Update user info
        if (dto.fullName || dto.phone || dto.email) {
            await this.prisma.user.update({
                where: { id: employee.userId },
                data: {
                    ...(dto.fullName && { fullName: dto.fullName }),
                    ...(dto.phone && { phone: dto.phone }),
                    ...(dto.email && { email: dto.email }),
                },
            });
        }

        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                ...(dto.code && { code: dto.code }),
                ...(dto.startDate && { startDate: new Date(dto.startDate) }),
            },
            include: { user: { select: { id: true, username: true, fullName: true, phone: true, email: true } } },
        });

        return { message: 'Employee updated successfully', data: updated };
    }

    async delete(id: number) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) throw new NotFoundException('Employee not found');

        await this.prisma.employee.delete({ where: { id } });
        return { message: 'Employee deleted successfully' };
    }
}
