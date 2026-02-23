import { PropertyCategoryService } from './property-category.service';
import { CreatePropertyCategoryDto, UpdatePropertyCategoryDto } from './dto/property-category.dto';
export declare class PropertyCategoryController {
    private readonly service;
    constructor(service: PropertyCategoryService);
    findAll(): Promise<{
        id: number;
        code: string;
        name: string;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        code: string;
        name: string;
    }>;
    create(dto: CreatePropertyCategoryDto): Promise<{
        id: number;
        code: string;
        name: string;
    }>;
    update(id: number, dto: UpdatePropertyCategoryDto): Promise<{
        id: number;
        code: string;
        name: string;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
