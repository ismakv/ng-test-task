export interface ListRequest {
    pageNumber: number;
    search?: string;
    itemsPerPage: 5 | 10 | 20;
}
