import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, ConfirmRegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        roles: string[];
        userId: number;
        employeeId: number | null;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
        tempData: {
            username: string;
            password: string;
            fullName: string | undefined;
            phone: string | undefined;
            email: string;
            address: string | undefined;
        };
    }>;
    confirmRegister(dto: ConfirmRegisterDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    loginGoogle(idToken: string): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        roles: string[];
        userId: number;
    }>;
}
