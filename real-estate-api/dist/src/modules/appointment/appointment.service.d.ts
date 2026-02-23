import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { CreateAppointmentDto, ApproveAppointmentDto, UpdateActualStatusDto } from './dto/appointment.dto';
export declare class AppointmentService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    create(dto: CreateAppointmentDto, userId: number): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            employeeId: number | null;
            houseId: number | null;
            landId: number | null;
            appointmentDate: Date;
            actualStatus: number | null;
            cancelReason: string | null;
            customerId: number;
        };
    }>;
    approve(id: number, dto: ApproveAppointmentDto): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            employeeId: number | null;
            houseId: number | null;
            landId: number | null;
            appointmentDate: Date;
            actualStatus: number | null;
            cancelReason: string | null;
            customerId: number;
        };
    }>;
    cancel(id: number): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            employeeId: number | null;
            houseId: number | null;
            landId: number | null;
            appointmentDate: Date;
            actualStatus: number | null;
            cancelReason: string | null;
            customerId: number;
        };
    }>;
    findAll(): Promise<({
        customer: {
            user: {
                phone: string | null;
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
        };
        employee: ({
            user: {
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            startDate: Date | null;
        }) | null;
        house: {
            title: string;
            city: string | null;
            district: string | null;
        } | null;
        land: {
            title: string;
            city: string | null;
            district: string | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        employeeId: number | null;
        houseId: number | null;
        landId: number | null;
        appointmentDate: Date;
        actualStatus: number | null;
        cancelReason: string | null;
        customerId: number;
    })[]>;
    findByEmployee(employeeId: number): Promise<({
        customer: {
            user: {
                phone: string | null;
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
        };
        house: {
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            houseNumber: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
        } | null;
        land: {
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            plotNumber: string | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        employeeId: number | null;
        houseId: number | null;
        landId: number | null;
        appointmentDate: Date;
        actualStatus: number | null;
        cancelReason: string | null;
        customerId: number;
    })[]>;
    updateActualStatus(id: number, dto: UpdateActualStatusDto): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            employeeId: number | null;
            houseId: number | null;
            landId: number | null;
            appointmentDate: Date;
            actualStatus: number | null;
            cancelReason: string | null;
            customerId: number;
        };
    }>;
}
