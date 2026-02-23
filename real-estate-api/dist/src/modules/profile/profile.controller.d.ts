import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
