import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    district: string;

    @IsNotEmpty()
    @IsString()
    ward: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    price: any;

    @IsNotEmpty()
    area: any;

    @IsOptional()
    @IsString()
    direction?: string;
}
