import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: number;
            createdAt: Date;
            userRoles: ({
                role: {
                    code: string;
                    name: string;
                };
            } & {
                id: number;
                userId: number;
                roleId: number;
            })[];
            username: string;
            phone: string | null;
            email: string | null;
            fullName: string | null;
            address: string | null;
            status: number;
        }[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    findById(id: number): Promise<{
        id: number;
        createdAt: Date;
        userRoles: ({
            role: {
                code: string;
                name: string;
            };
        } & {
            id: number;
            userId: number;
            roleId: number;
        })[];
        username: string;
        phone: string | null;
        email: string | null;
        fullName: string | null;
        address: string | null;
        status: number;
    }>;
    create(dto: CreateUserDto): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            username: string;
            phone: string | null;
            email: string | null;
            password: string;
            fullName: string | null;
            address: string | null;
            status: number;
        };
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            username: string;
            phone: string | null;
            email: string | null;
            password: string;
            fullName: string | null;
            address: string | null;
            status: number;
        };
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
    changePassword(id: number, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
