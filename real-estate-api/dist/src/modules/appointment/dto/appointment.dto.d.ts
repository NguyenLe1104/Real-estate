export declare class CreateAppointmentDto {
    houseId?: number;
    landId?: number;
    appointmentDate: string;
}
export declare class ApproveAppointmentDto {
    employeeId: number;
}
export declare class UpdateActualStatusDto {
    actualStatus: number;
    cancelReason?: string;
}
