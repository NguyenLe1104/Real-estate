import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, ConfirmRegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh-token')
    refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    logout(@Body('refreshToken') refreshToken: string) {
        return this.authService.logout(refreshToken);
    }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('register/confirm')
    confirmRegister(@Body() dto: ConfirmRegisterDto) {
        return this.authService.confirmRegister(dto);
    }

    @Post('forgot-password')
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('login-google')
    loginGoogle(@Body('idToken') idToken: string) {
        return this.authService.loginGoogle(idToken);
    }
}
