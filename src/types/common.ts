// Common types used across the application
export interface IApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    cached?: boolean;
}

// Type for JSON-serializable values that Redis can store
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export interface IPaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IPaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// TS generics with interface inheritance
export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    pagination: IPaginationMetadata;
}
// <T[]> means: Take the generic type T, make it an array, and pass this array type to IApiResponse
