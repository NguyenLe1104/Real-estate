import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.dto';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    findApproved(page?: number, limit?: number): Promise<{
        currentPage: number;
        totalPages: number;
        totalItems: number;
        data: ({
            user: {
                id: number;
                username: string;
                phone: string | null;
                fullName: string | null;
            };
            images: {
                id: number;
                url: string;
                position: number | null;
            }[];
        } & {
            id: number;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            status: number;
            userId: number;
            title: string;
            city: string;
            district: string;
            ward: string;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            direction: string | null;
            postedAt: Date;
            approvedAt: Date | null;
        })[];
    }>;
    findPending(): Promise<({
        user: {
            id: number;
            username: string;
            phone: string | null;
            fullName: string | null;
        };
        images: {
            id: number;
            url: string;
            position: number | null;
        }[];
    } & {
        id: number;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: number;
        userId: number;
        title: string;
        city: string;
        district: string;
        ward: string;
        price: import("@prisma/client/runtime/library").Decimal;
        area: import("@prisma/client/runtime/library").Decimal;
        direction: string | null;
        postedAt: Date;
        approvedAt: Date | null;
    })[]>;
    findAll(): Promise<({
        user: {
            id: number;
            username: string;
            phone: string | null;
            fullName: string | null;
        };
        images: {
            id: number;
            url: string;
            position: number | null;
        }[];
    } & {
        id: number;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: number;
        userId: number;
        title: string;
        city: string;
        district: string;
        ward: string;
        price: import("@prisma/client/runtime/library").Decimal;
        area: import("@prisma/client/runtime/library").Decimal;
        direction: string | null;
        postedAt: Date;
        approvedAt: Date | null;
    })[]>;
    findByUser(req: any): Promise<({
        images: {
            id: number;
            url: string;
            position: number | null;
        }[];
    } & {
        id: number;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: number;
        userId: number;
        title: string;
        city: string;
        district: string;
        ward: string;
        price: import("@prisma/client/runtime/library").Decimal;
        area: import("@prisma/client/runtime/library").Decimal;
        direction: string | null;
        postedAt: Date;
        approvedAt: Date | null;
    })[]>;
    findById(id: number): Promise<{
        user: {
            id: number;
            username: string;
            phone: string | null;
            fullName: string | null;
        };
        images: {
            id: number;
            url: string;
            position: number | null;
        }[];
    } & {
        id: number;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        status: number;
        userId: number;
        title: string;
        city: string;
        district: string;
        ward: string;
        price: import("@prisma/client/runtime/library").Decimal;
        area: import("@prisma/client/runtime/library").Decimal;
        direction: string | null;
        postedAt: Date;
        approvedAt: Date | null;
    }>;
    create(dto: CreatePostDto, req: any, files: Express.Multer.File[]): Promise<{
        message: string;
        data: ({
            images: {
                id: number;
                url: string;
                position: number | null;
            }[];
        } & {
            id: number;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            status: number;
            userId: number;
            title: string;
            city: string;
            district: string;
            ward: string;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            direction: string | null;
            postedAt: Date;
            approvedAt: Date | null;
        }) | null;
    }>;
    approve(id: number): Promise<{
        message: string;
        data: {
            id: number;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            status: number;
            userId: number;
            title: string;
            city: string;
            district: string;
            ward: string;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            direction: string | null;
            postedAt: Date;
            approvedAt: Date | null;
        };
    }>;
    reject(id: number): Promise<{
        message: string;
        data: {
            id: number;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            status: number;
            userId: number;
            title: string;
            city: string;
            district: string;
            ward: string;
            price: import("@prisma/client/runtime/library").Decimal;
            area: import("@prisma/client/runtime/library").Decimal;
            direction: string | null;
            postedAt: Date;
            approvedAt: Date | null;
        };
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
