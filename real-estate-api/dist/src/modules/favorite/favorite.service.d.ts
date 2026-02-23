import { PrismaService } from '../../prisma/prisma.service';
export declare class FavoriteService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: number): Promise<({
        house: ({
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
        }) | null;
        land: ({
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
        }) | null;
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        houseId: number | null;
        landId: number | null;
    })[]>;
    addHouse(userId: number, houseId: number): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            userId: number;
            houseId: number | null;
            landId: number | null;
        };
    }>;
    addLand(userId: number, landId: number): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            userId: number;
            houseId: number | null;
            landId: number | null;
        };
    }>;
    removeHouse(userId: number, houseId: number): Promise<{
        message: string;
    }>;
    removeLand(userId: number, landId: number): Promise<{
        message: string;
    }>;
}
