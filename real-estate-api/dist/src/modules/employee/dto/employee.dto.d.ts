export declare class CreateEmployeeDto {
    code: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    email?: string;
    startDate?: string;
}
declare const UpdateEmployeeDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEmployeeDto>>;
export declare class UpdateEmployeeDto extends UpdateEmployeeDto_base {
}
export {};
