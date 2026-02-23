import { HouseService } from './house.service';
import { CreateHouseDto, UpdateHouseDto } from './dto/house.dto';
export declare class HouseController {
    private readonly houseService;
    constructor(houseService: HouseService);
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            employee: ({
                user: {
                    id: number;
                    phone: string | null;
                    fullName: string | null;
                };
            } & {
                id: number;
                code: string;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                startDate: Date | null;
            }) | null;
            category: {
                id: number;
                code: string;
                name: string;
            } | null;
            images: {
                id: number;
                url: string;
            }[];
        } & {
            id: number;
            code: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            houseNumber: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            floors: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            categoryId: number | null;
            employeeId: number | null;
        })[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    search(query: string, page?: number, limit?: number): Promise<{
        data: ({
            category: {
                id: number;
                code: string;
                name: string;
            } | null;
            images: {
                url: string;
            }[];
        } & {
            id: number;
            code: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            houseNumber: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            floors: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            categoryId: number | null;
            employeeId: number | null;
        })[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    findById(id: number): Promise<{
        employee: ({
            user: {
                id: number;
                phone: string | null;
                fullName: string | null;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            startDate: Date | null;
        }) | null;
        category: {
            id: number;
            code: string;
            name: string;
        } | null;
        images: {
            id: number;
            url: string;
        }[];
    } & {
        id: number;
        code: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: number;
        title: string;
        city: string | null;
        district: string | null;
        ward: string | null;
        street: string | null;
        houseNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        area: number | null;
        direction: string | null;
        floors: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        categoryId: number | null;
        employeeId: number | null;
    }>;
    create(dto: CreateHouseDto, files: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            employee: ({
                user: {
                    id: number;
                    phone: string | null;
                    fullName: string | null;
                };
            } & {
                id: number;
                code: string;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                startDate: Date | null;
            }) | null;
            category: {
                id: number;
                code: string;
                name: string;
            } | null;
            images: {
                id: number;
                url: string;
            }[];
        } & {
            id: number;
            code: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            houseNumber: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            floors: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            categoryId: number | null;
            employeeId: number | null;
        };
    }>;
    update(id: number, dto: UpdateHouseDto, files: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            employee: ({
                user: {
                    id: number;
                    phone: string | null;
                    fullName: string | null;
                };
            } & {
                id: number;
                code: string;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                startDate: Date | null;
            }) | null;
            category: {
                id: number;
                code: string;
                name: string;
            } | null;
            images: {
                id: number;
                url: string;
            }[];
        } & {
            id: number;
            code: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: number;
            title: string;
            city: string | null;
            district: string | null;
            ward: string | null;
            street: string | null;
            houseNumber: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            floors: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            categoryId: number | null;
            employeeId: number | null;
        };
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
