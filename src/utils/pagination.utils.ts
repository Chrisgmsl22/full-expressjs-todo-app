import { IPaginationMetadata, IPaginationParams } from "../types";

/**
 * Validates and normalizes pagination parameters
 * @param page - Page number from query (starts at 1)
 * @param limit - Items per page
 * @returns Validated pagination params
 */
export const validatePaginationParams = (
    page?: number,
    limit?: number
): Partial<IPaginationParams> => {
    // Default values
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100; // Prevents requesting too many items

    // Parse and validate data
    let validPage = parseInt(String(page || DEFAULT_PAGE));
    if (isNaN(validPage) || validPage < 1) {
        validPage = DEFAULT_PAGE;
    }

    // Parse and validate limit
    let validLimit = parseInt(String(limit || DEFAULT_LIMIT));
    if (isNaN(validLimit) || validLimit < 1) {
        validLimit = DEFAULT_LIMIT;
    }

    if (validLimit > MAX_LIMIT) {
        validLimit = MAX_LIMIT; // Defaults back to 100 in case we try to request too many items
    }

    return { page: validPage, limit: validLimit };
};

/**
 * Calculates pagination metadata
 * @param currentPage - Current page number
 * @param itemsPerPage - Items per page
 * @param totalItems - Total number of items in db
 * @returns  Pagination metadata
 */
export const calculatePaginationMetadata = (
    currentPage: number,
    itemsPerPage: number,
    totalItems: number
): IPaginationMetadata => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
        currentPage,
        totalPages: totalPages || 1, // At least one page, even if empty
        totalItems,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    };
};

/**
 * Calculates MongoDB skip value for pagination
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Number of documents to skip
 */
export const calculateSkip = (page: number, limit: number): number =>
    (page - 1) * limit;
