import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateRoleDto): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateRoleDto): Promise<{
        id: number;
        code: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
