import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

export class CreateAppointmentDto {
    @IsOptional()
    @IsInt()
    houseId?: number;

    @IsOptional()
    @IsInt()
    landId?: number;

    @IsNotEmpty()
    @IsString()
    appointmentDate: string;
}

export class ApproveAppointmentDto {
    @IsNotEmpty()
    @IsInt()
    employeeId: number;
}

export class UpdateActualStatusDto {
    @IsNotEmpty()
    @IsInt()
    actualStatus: number;

    @IsOptional()
    @IsString()
    cancelReason?: string;
}
