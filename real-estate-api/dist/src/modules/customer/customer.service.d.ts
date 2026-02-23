import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomerService {
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
                address: string | null;
                status: number;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
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
            address: string | null;
            status: number;
        };
    } & {
        id: number;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
}
