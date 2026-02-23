import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePropertyCategoryDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    name: string;
}

export class UpdatePropertyCategoryDto extends PartialType(CreatePropertyCategoryDto) { }
