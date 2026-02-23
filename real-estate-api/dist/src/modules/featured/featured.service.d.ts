import { PrismaService } from '../../prisma/prisma.service';
export declare class FeaturedService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeaturedHouses(limit?: number): Promise<({
        _count: {
            appointments: number;
        };
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
    })[]>;
    getFeaturedLands(limit?: number): Promise<({
        _count: {
            appointments: number;
        };
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
    })[]>;
    getFeaturedProperties(limit?: number): Promise<{
        houses: ({
            _count: {
                appointments: number;
            };
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
        lands: ({
            _count: {
                appointments: number;
            };
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
    }>;
}
