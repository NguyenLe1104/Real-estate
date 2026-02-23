"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const appointment_service_1 = require("./appointment.service");
const appointment_dto_1 = require("./dto/appointment.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AppointmentController = class AppointmentController {
    appointmentService;
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    create(dto, req) {
        return this.appointmentService.create(dto, req.user.id);
    }
    approve(id, dto) {
        return this.appointmentService.approve(id, dto);
    }
    cancel(id) {
        return this.appointmentService.cancel(id);
    }
    findAll() {
        return this.appointmentService.findAll();
    }
    findByEmployee(id) {
        return this.appointmentService.findByEmployee(id);
    }
    updateActualStatus(id, dto) {
        return this.appointmentService.updateActualStatus(id, dto);
    }
};
exports.AppointmentController = AppointmentController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, appointment_dto_1.ApproveAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('employee/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "findByEmployee", null);
__decorate([
    (0, common_1.Put)(':id/actual-status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'EMPLOYEE'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, appointment_dto_1.UpdateActualStatusDto]),
    __metadata("design:returntype", void 0)
], AppointmentController.prototype, "updateActualStatus", null);
exports.AppointmentController = AppointmentController = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [appointment_service_1.AppointmentService])
], AppointmentController);
//# sourceMappingURL=appointment.controller.js.map