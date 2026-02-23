import {
    Controller, Get, Post, Put, Param, Body, Req,
    UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, ApproveAppointmentDto, UpdateActualStatusDto } from './dto/appointment.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Post()
    @Roles('CUSTOMER')
    create(@Body() dto: CreateAppointmentDto, @Req() req: any) {
        return this.appointmentService.create(dto, req.user.id);
    }

    @Put(':id/approve')
    @Roles('ADMIN')
    approve(@Param('id', ParseIntPipe) id: number, @Body() dto: ApproveAppointmentDto) {
        return this.appointmentService.approve(id, dto);
    }

    @Put(':id/cancel')
    @Roles('ADMIN')
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.cancel(id);
    }

    @Get()
    @Roles('ADMIN')
    findAll() {
        return this.appointmentService.findAll();
    }

    @Get('employee/:id')
    @Roles('ADMIN', 'EMPLOYEE')
    findByEmployee(@Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.findByEmployee(id);
    }

    @Put(':id/actual-status')
    @Roles('ADMIN', 'EMPLOYEE')
    updateActualStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActualStatusDto) {
        return this.appointmentService.updateActualStatus(id, dto);
    }
}
