"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../../common/mail/mail.service");
const format_datetime_1 = require("../../common/utils/format-datetime");
let AppointmentService = class AppointmentService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(dto, userId) {
        const customer = await this.prisma.customer.findUnique({ where: { userId } });
        if (!customer)
            throw new common_1.BadRequestException('Customer not found');
        if (!dto.houseId && !dto.landId) {
            throw new common_1.BadRequestException('Either houseId or landId is required');
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
    async approve(id, dto) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { user: { select: { fullName: true, email: true } } },
                },
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        const conflict = await this.prisma.appointment.findFirst({
            where: {
                employeeId: dto.employeeId,
                appointmentDate: appointment.appointmentDate,
                status: 1,
            },
        });
        if (conflict)
            throw new common_1.BadRequestException('Employee already has an appointment at this time');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { employeeId: dto.employeeId, status: 1 },
        });
        if (appointment.customer?.user?.email) {
            const html = this.mailService.getApprovalEmailHtml(appointment.customer.user.fullName || 'Customer', (0, format_datetime_1.formatDateTime)(appointment.appointmentDate));
            await this.mailService.sendEmail(appointment.customer.user.email, 'Appointment Approved - Real Estate', html);
        }
        return { message: 'Appointment approved', data: updated };
    }
    async cancel(id) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { user: { select: { fullName: true, email: true } } },
                },
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        if (appointment.status === 2)
            throw new common_1.BadRequestException('Appointment already cancelled');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: 2 },
        });
        if (appointment.customer?.user?.email) {
            const html = this.mailService.getCancellationEmailHtml(appointment.customer.user.fullName || 'Customer', (0, format_datetime_1.formatDateTime)(appointment.appointmentDate));
            await this.mailService.sendEmail(appointment.customer.user.email, 'Appointment Cancelled - Real Estate', html);
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
    async findByEmployee(employeeId) {
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
    async updateActualStatus(id, dto) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id } });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: {
                actualStatus: dto.actualStatus,
                cancelReason: dto.cancelReason,
            },
        });
        return { message: 'Actual status updated', data: updated };
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map