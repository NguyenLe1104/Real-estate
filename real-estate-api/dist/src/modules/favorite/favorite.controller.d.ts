import { FavoriteService } from './favorite.service';
export declare class FavoriteController {
    private readonly favoriteService;
    constructor(favoriteService: FavoriteService);
    findByUser(req: any): Promise<({
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
    addHouse(houseId: number, req: any): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            userId: number;
            houseId: number | null;
            landId: number | null;
        };
    }>;
    addLand(landId: number, req: any): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            userId: number;
            houseId: number | null;
            landId: number | null;
        };
    }>;
    removeHouse(houseId: number, req: any): Promise<{
        message: string;
    }>;
    removeLand(landId: number, req: any): Promise<{
        message: string;
    }>;
}
