import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CreateLandDto, UpdateLandDto } from './dto/land.dto';
export declare class LandService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
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
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            categoryId: number | null;
            employeeId: number | null;
            plotNumber: string | null;
            frontWidth: number | null;
            landLength: number | null;
            landType: string | null;
            legalStatus: string | null;
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
        price: import("@prisma/client/runtime/library").Decimal | null;
        area: number | null;
        direction: string | null;
        categoryId: number | null;
        employeeId: number | null;
        plotNumber: string | null;
        frontWidth: number | null;
        landLength: number | null;
        landType: string | null;
        legalStatus: string | null;
    }>;
    create(dto: CreateLandDto, files?: Express.Multer.File[]): Promise<{
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
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            categoryId: number | null;
            employeeId: number | null;
            plotNumber: string | null;
            frontWidth: number | null;
            landLength: number | null;
            landType: string | null;
            legalStatus: string | null;
        };
    }>;
    update(id: number, dto: UpdateLandDto, files?: Express.Multer.File[]): Promise<{
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
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            categoryId: number | null;
            employeeId: number | null;
            plotNumber: string | null;
            frontWidth: number | null;
            landLength: number | null;
            landType: string | null;
            legalStatus: string | null;
        };
    }>;
    delete(id: number): Promise<{
        message: string;
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
            price: import("@prisma/client/runtime/library").Decimal | null;
            area: number | null;
            direction: string | null;
            categoryId: number | null;
            employeeId: number | null;
            plotNumber: string | null;
            frontWidth: number | null;
            landLength: number | null;
            landType: string | null;
            legalStatus: string | null;
        })[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
}
