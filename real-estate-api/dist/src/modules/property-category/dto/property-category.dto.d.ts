export declare class CreatePropertyCategoryDto {
    code: string;
    name: string;
}
declare const UpdatePropertyCategoryDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePropertyCategoryDto>>;
export declare class UpdatePropertyCategoryDto extends UpdatePropertyCategoryDto_base {
}
export {};
