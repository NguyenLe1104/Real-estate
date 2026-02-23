export interface PaginationResult<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}
export declare function paginate<T>(items: T[], total: number, page: number, limit: number): PaginationResult<T>;
