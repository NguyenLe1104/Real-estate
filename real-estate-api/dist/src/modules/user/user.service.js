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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    phone: true,
                    email: true,
                    address: true,
                    status: true,
                    createdAt: true,
                    userRoles: { include: { role: { select: { code: true, name: true } } } },
                },
            }),
            this.prisma.user.count(),
        ]);
        return {
            data: users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
                email: true,
                address: true,
                status: true,
                createdAt: true,
                userRoles: { include: { role: { select: { code: true, name: true } } } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(dto) {
        const existUser = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existUser)
            throw new common_1.BadRequestException('Username already exists');
        if (dto.email) {
            const existEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (existEmail)
                throw new common_1.BadRequestException('Email already exists');
        }
        const hashPass = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashPass,
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                status: dto.status ?? 1,
            },
        });
        if (dto.roleIds?.length) {
            await this.prisma.userRole.createMany({
                data: dto.roleIds.map((roleId) => ({ userId: user.id, roleId })),
            });
        }
        return { message: 'User created successfully', data: user };
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const data = { ...dto };
        delete data.roleIds;
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        const updated = await this.prisma.user.update({ where: { id }, data });
        return { message: 'User updated successfully', data: updated };
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
    async changePassword(id, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashPass = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id }, data: { password: hashPass } });
        return { message: 'Password changed successfully' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map