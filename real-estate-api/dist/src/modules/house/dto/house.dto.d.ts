export declare class CreateHouseDto {
    code: string;
    title: string;
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
    houseNumber?: string;
    description?: string;
    price?: any;
    area?: any;
    direction?: string;
    floors?: any;
    bedrooms?: any;
    bathrooms?: any;
    categoryId?: any;
    employeeId?: any;
}
declare const UpdateHouseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateHouseDto>>;
export declare class UpdateHouseDto extends UpdateHouseDto_base {
    status?: number;
}
export {};
