import { CustomerService } from './customer.service';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    findAll(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: number;
                username: string;
                phone: string | null;
                email: string | null;
                fullName: string | null;
                address: string | null;
                status: number;
            };
        } & {
            id: number;
            code: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
        })[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    findById(id: number): Promise<{
        user: {
            id: number;
            username: string;
            phone: string | null;
            email: string | null;
            fullName: string | null;
            address: string | null;
            status: number;
        };
    } & {
        id: number;
        code: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
}
