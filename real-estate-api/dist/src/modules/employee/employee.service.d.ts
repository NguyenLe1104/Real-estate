import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: number;
                username: string;
                phone: string | null;
                email: string | null;
                fullName: string | null;
                status: number;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            startDate: Date | null;
        })[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    findById(id: number): Promise<{
        user: {
            id: number;
            username: string;
            phone: string | null;
            email: string | null;
            fullName: string | null;
            status: number;
        };
    } & {
        id: number;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        startDate: Date | null;
    }>;
    create(dto: CreateEmployeeDto): Promise<{
        message: string;
        data: {
            user: {
                id: number;
                username: string;
                phone: string | null;
                email: string | null;
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            startDate: Date | null;
        };
    }>;
    update(id: number, dto: UpdateEmployeeDto): Promise<{
        message: string;
        data: {
            user: {
                id: number;
                username: string;
                phone: string | null;
                email: string | null;
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            startDate: Date | null;
        };
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
