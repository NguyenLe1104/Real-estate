export declare class RegisterDto {
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    email: string;
    address?: string;
}
export declare class ConfirmRegisterDto extends RegisterDto {
    otp: string;
}
