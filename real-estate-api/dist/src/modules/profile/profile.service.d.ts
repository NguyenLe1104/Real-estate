import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
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
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        message: string;
        data: {
            id: number;
            username: string;
            phone: string | null;
            email: string | null;
            fullName: string | null;
            address: string | null;
        };
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
