import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { formatDateTime } from '../../common/utils/format-datetime';
import { CreateAppointmentDto, ApproveAppointmentDto, UpdateActualStatusDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async create(dto: CreateAppointmentDto, userId: number) {
        const customer = await this.prisma.customer.findUnique({ where: { userId } });
        if (!customer) throw new BadRequestException('Customer not found');

        if (!dto.houseId && !dto.landId) {
            throw new BadRequestException('Either houseId or landId is required');
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                houseId: dto.houseId || null,
                landId: dto.landId || null,
                customerId: customer.id,
                employeeId: null,
                appointmentDate: new Date(dto.appointmentDate),
                status: 0,
            },
        });

        return { message: 'Appointment created successfully, awaiting approval', data: appointment };
    }

    async approve(id: number, dto: ApproveAppointmentDto) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { user: { select: { fullName: true, email: true } } },
                },
            },
        });
        if (!appointment) throw new NotFoundException('Appointment not found');

        // Check employee schedule conflict
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                employeeId: dto.employeeId,
                appointmentDate: appointment.appointmentDate,
                status: 1,
            },
        });
        if (conflict) throw new BadRequestException('Employee already has an appointment at this time');

        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { employeeId: dto.employeeId, status: 1 },
        });

        // Send approval email
        if (appointment.customer?.user?.email) {
            const html = this.mailService.getApprovalEmailHtml(
                appointment.customer.user.fullName || 'Customer',
                formatDateTime(appointment.appointmentDate),
            );
            await this.mailService.sendEmail(
                appointment.customer.user.email,
                'Appointment Approved - Real Estate',
                html,
            );
        }

        return { message: 'Appointment approved', data: updated };
    }

    async cancel(id: number) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { user: { select: { fullName: true, email: true } } },
                },
            },
        });
        if (!appointment) throw new NotFoundException('Appointment not found');
        if (appointment.status === 2) throw new BadRequestException('Appointment already cancelled');

        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: 2 },
        });

        if (appointment.customer?.user?.email) {
            const html = this.mailService.getCancellationEmailHtml(
                appointment.customer.user.fullName || 'Customer',
                formatDateTime(appointment.appointmentDate),
            );
            await this.mailService.sendEmail(
                appointment.customer.user.email,
                'Appointment Cancelled - Real Estate',
                html,
            );
        }

        return { message: 'Appointment cancelled', data: updated };
    }

    async findAll() {
        return this.prisma.appointment.findMany({
            include: {
                employee: {
                    include: { user: { select: { fullName: true } } },
                },
                customer: {
                    include: { user: { select: { fullName: true, phone: true } } },
                },
                house: { select: { title: true, city: true, district: true } },
                land: { select: { title: true, city: true, district: true } },
            },
        });
    }

    async findByEmployee(employeeId: number) {
        return this.prisma.appointment.findMany({
            where: { employeeId, status: 1 },
            include: {
                customer: {
                    include: { user: { select: { fullName: true, phone: true } } },
                },
                house: {
                    select: { title: true, city: true, district: true, ward: true, street: true, houseNumber: true, price: true, area: true, direction: true },
                },
                land: {
                    select: { title: true, city: true, district: true, ward: true, street: true, plotNumber: true, price: true, area: true, direction: true },
                },
            },
        });
    }

    async updateActualStatus(id: number, dto: UpdateActualStatusDto) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id } });
        if (!appointment) throw new NotFoundException('Appointment not found');

        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                actualStatus: dto.actualStatus,
                cancelReason: dto.cancelReason,
            },
        });

        return { message: 'Actual status updated', data: updated };
    }
}
