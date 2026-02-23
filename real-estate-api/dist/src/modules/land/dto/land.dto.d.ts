export declare class CreateLandDto {
    code: string;
    title: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
    plotNumber?: string;
    description?: string;
    price?: any;
    area?: any;
    direction?: string;
    frontWidth?: any;
    landLength?: any;
    landType?: string;
    legalStatus?: string;
    categoryId?: any;
    employeeId?: any;
}
declare const UpdateLandDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateLandDto>>;
export declare class UpdateLandDto extends UpdateLandDto_base {
    status?: number;
}
export {};
