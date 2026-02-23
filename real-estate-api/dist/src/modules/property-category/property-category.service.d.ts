import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyCategoryDto, UpdatePropertyCategoryDto } from './dto/property-category.dto';
export declare class PropertyCategoryService {
    private prisma;
    constructor(prisma: PrismaService);
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
