export declare class CreateUserDto {
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: number;
    roleIds?: number[];
}
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export {};
