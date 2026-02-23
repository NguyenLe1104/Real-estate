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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let EmployeeService = class EmployeeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, username: true, fullName: true, phone: true, email: true, status: true },
                    },
                },
            }),
            this.prisma.employee.count(),
        ]);
        return {
            data: employees,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    }
    async findById(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, username: true, fullName: true, phone: true, email: true, status: true },
                },
            },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return employee;
    }
    async create(dto) {
        const existUser = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existUser)
            throw new common_1.BadRequestException('Username already exists');
        const hashPass = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashPass,
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                status: 1,
            },
        });
        const empRole = await this.prisma.role.findUnique({ where: { code: 'EMPLOYEE' } });
        if (empRole) {
            await this.prisma.userRole.create({ data: { userId: user.id, roleId: empRole.id } });
        }
        const employee = await this.prisma.employee.create({
            data: {
                code: dto.code,
                startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
                userId: user.id,
            },
            include: { user: { select: { id: true, username: true, fullName: true, phone: true, email: true } } },
        });
        return { message: 'Employee created successfully', data: employee };
    }
    async update(id, dto) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (dto.fullName || dto.phone || dto.email) {
            await this.prisma.user.update({
                where: { id: employee.userId },
                data: {
                    ...(dto.fullName && { fullName: dto.fullName }),
                    ...(dto.phone && { phone: dto.phone }),
                    ...(dto.email && { email: dto.email }),
                },
            });
        }
        const updated = await this.prisma.employee.update({
            where: { id },
            data: {
                ...(dto.code && { code: dto.code }),
                ...(dto.startDate && { startDate: new Date(dto.startDate) }),
            },
            include: { user: { select: { id: true, username: true, fullName: true, phone: true, email: true } } },
        });
        return { message: 'Employee updated successfully', data: updated };
    }
    async delete(id) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        await this.prisma.employee.delete({ where: { id } });
        return { message: 'Employee deleted successfully' };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map