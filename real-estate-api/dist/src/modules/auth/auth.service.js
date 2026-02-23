"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const ms_1 = __importDefault(require("ms"));
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../../common/mail/mail.service");
const generate_otp_1 = require("../../common/utils/generate-otp");
const google_auth_library_1 = require("google-auth-library");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    mailService;
    googleClient;
    maxTokens;
    constructor(prisma, jwtService, configService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
        this.maxTokens = parseInt(this.configService.get('MAX_REFRESH_TOKENS_PER_USER') || '5');
    }
    async login(dto) {
        const { username, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId: user.id },
            include: { role: { select: { code: true } } },
        });
        const roles = userRoles.map((ur) => ur.role.code);
        let employeeId = null;
        if (roles.includes('EMPLOYEE')) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (employee)
                employeeId = employee.id;
        }
        const accessToken = this.jwtService.sign({ id: user.id, username: user.username, roles });
        const refreshToken = this.jwtService.sign({ id: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d',
        });
        const refreshExpiresMs = (0, ms_1.default)((this.configService.get('JWT_REFRESH_EXPIRES') || '7d'));
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshExpiresMs),
                revoked: false,
            },
        });
        const allTokens = await this.prisma.refreshToken.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (allTokens.length > this.maxTokens) {
            const idsToDelete = allTokens.slice(this.maxTokens).map((t) => t.id);
            await this.prisma.refreshToken.deleteMany({ where: { id: { in: idsToDelete } } });
        }
        return {
            message: 'Login successful',
            accessToken,
            refreshToken,
            roles,
            userId: user.id,
            employeeId,
        };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('Missing refresh token');
        const savedToken = await this.prisma.refreshToken.findFirst({
            where: { token: refreshToken, revoked: false },
        });
        if (!savedToken)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const userRoles = await this.prisma.userRole.findMany({
                where: { userId: decoded.id },
                include: { role: { select: { code: true } } },
            });
            const roles = userRoles.map((ur) => ur.role.code);
            const newAccessToken = this.jwtService.sign({ id: decoded.id, roles });
            return { accessToken: newAccessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async logout(refreshToken) {
        if (!refreshToken)
            throw new common_1.BadRequestException('Missing refresh token');
        const token = await this.prisma.refreshToken.findFirst({ where: { token: refreshToken } });
        if (token) {
            await this.prisma.refreshToken.update({
                where: { id: token.id },
                data: { revoked: true },
            });
        }
        return { message: 'Logout successful' };
    }
    async register(dto) {
        const { username, password, fullName, phone, email, address } = dto;
        const existUser = await this.prisma.user.findUnique({ where: { username } });
        if (existUser)
            throw new common_1.BadRequestException('Username already exists');
        if (email) {
            const existEmail = await this.prisma.user.findUnique({ where: { email } });
            if (existEmail)
                throw new common_1.BadRequestException('Email already registered');
        }
        if (phone) {
            const existPhone = await this.prisma.user.findUnique({ where: { phone } });
            if (existPhone)
                throw new common_1.BadRequestException('Phone number already registered');
        }
        const otp = (0, generate_otp_1.generateOTP)();
        const expireAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.passwordReset.deleteMany({ where: { email, type: 'register' } });
        await this.prisma.passwordReset.create({ data: { email, otp, expireAt, type: 'register' } });
        const html = `
      <p>Hello ${fullName || username},</p>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code expires in 5 minutes.</p>
    `;
        await this.mailService.sendEmail(email, 'Registration OTP Verification', html);
        return {
            message: 'OTP sent to your email. Please verify to complete registration.',
            tempData: { username, password, fullName, phone, email, address },
        };
    }
    async confirmRegister(dto) {
        const { username, password, fullName, phone, email, address, otp } = dto;
        const record = await this.prisma.passwordReset.findFirst({
            where: { email, otp, type: 'register' },
        });
        if (!record)
            throw new common_1.BadRequestException('Invalid or expired OTP');
        if (record.expireAt < new Date()) {
            await this.prisma.passwordReset.deleteMany({ where: { email, type: 'register' } });
            throw new common_1.BadRequestException('OTP has expired');
        }
        const hashPass = await bcrypt.hash(password, 10);
        const newUser = await this.prisma.user.create({
            data: { username, password: hashPass, fullName, phone, email, address, status: 1 },
        });
        const customerRole = await this.prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
        if (customerRole) {
            await this.prisma.userRole.create({ data: { userId: newUser.id, roleId: customerRole.id } });
        }
        await this.prisma.customer.create({
            data: { userId: newUser.id, code: `KH${newUser.id.toString().padStart(3, '0')}` },
        });
        await this.prisma.passwordReset.deleteMany({ where: { email, type: 'register' } });
        return { message: 'Registration successful' };
    }
    async forgotPassword(dto) {
        const { email } = dto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException('Email not registered');
        const otp = (0, generate_otp_1.generateOTP)();
        const expireAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.passwordReset.deleteMany({ where: { email, type: 'reset' } });
        await this.prisma.passwordReset.create({ data: { email, otp, expireAt, type: 'reset' } });
        const html = `
      <p>Hello ${user.fullName || user.username},</p>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code expires in 5 minutes.</p>
    `;
        await this.mailService.sendEmail(email, 'Password Reset OTP', html);
        return { message: 'OTP sent to your email' };
    }
    async resetPassword(dto) {
        const { email, otp, newPassword } = dto;
        const record = await this.prisma.passwordReset.findFirst({
            where: { email, otp, type: 'reset' },
        });
        if (!record)
            throw new common_1.BadRequestException('Invalid OTP');
        if (record.expireAt < new Date()) {
            await this.prisma.passwordReset.deleteMany({ where: { email, type: 'reset' } });
            throw new common_1.BadRequestException('OTP has expired');
        }
        const hashPass = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { email }, data: { password: hashPass } });
        await this.prisma.passwordReset.deleteMany({ where: { email, type: 'reset' } });
        return { message: 'Password reset successful' };
    }
    async loginGoogle(idToken) {
        if (!idToken)
            throw new common_1.BadRequestException('Missing Google ID Token');
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: this.configService.get('GOOGLE_CLIENT_ID'),
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new common_1.BadRequestException('Invalid Google token payload');
        const { email, name } = payload;
        if (!email)
            throw new common_1.BadRequestException('Google account has no email');
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const hashPass = await bcrypt.hash('google_oauth_user', 10);
            user = await this.prisma.user.create({
                data: { username: email, email, password: hashPass, fullName: name || '', status: 1 },
            });
        }
        const customerRole = await this.prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
        if (customerRole) {
            const existedRole = await this.prisma.userRole.findFirst({
                where: { userId: user.id, roleId: customerRole.id },
            });
            if (!existedRole) {
                await this.prisma.userRole.create({ data: { userId: user.id, roleId: customerRole.id } });
            }
        }
        await this.prisma.customer.upsert({
            where: { userId: user.id },
            create: { userId: user.id, code: `KH${user.id.toString().padStart(3, '0')}` },
            update: {},
        });
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId: user.id },
            include: { role: { select: { code: true } } },
        });
        const roles = userRoles.map((ur) => ur.role.code);
        const accessToken = this.jwtService.sign({ id: user.id, username: user.username, roles });
        const refreshToken = this.jwtService.sign({ id: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d',
        });
        const refreshExpiresMs = (0, ms_1.default)((this.configService.get('JWT_REFRESH_EXPIRES') || '7d'));
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshExpiresMs),
                revoked: false,
            },
        });
        return {
            message: 'Login successful',
            accessToken,
            refreshToken,
            roles,
            userId: user.id,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map