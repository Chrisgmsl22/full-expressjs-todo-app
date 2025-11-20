import {
    validatePaginationParams,
    calculatePaginationMetadata,
    calculateSkip,
} from "../pagination.utils";

describe("Pagination Utils", () => {
    describe("validatePaginationParams", () => {
        it("Should return default values when no params provided", () => {
            const result = validatePaginationParams(undefined, undefined);
            expect(result).toEqual({ page: 1, limit: 10 });
        });

        it("Should validate and return correct params", () => {
            const result = validatePaginationParams(2, 20);
            expect(result).toEqual({ page: 2, limit: 20 });
        });

        it("Should default to page 1 for invalid page numbers", () => {
            expect(validatePaginationParams(-1, 10).page).toBe(1);
            expect(validatePaginationParams(0, 10).page).toBe(1);
            expect(validatePaginationParams(NaN, 10).page).toBe(1);
        });

        it("Should cap limit at MAX_LIMIT (100)", () => {
            const result = validatePaginationParams(1, 500);
            expect(result.limit).toBe(100);
        });

        it("Should default to limit 10 for invalid limits", () => {
            expect(validatePaginationParams(1, -1).limit).toBe(10);
            expect(validatePaginationParams(1, 0).limit).toBe(10);
            expect(validatePaginationParams(1, NaN).limit).toBe(10);
        });
    });

    describe("calculatePaginationMetadata", () => {
        it("Should calculate correct metadata for first page", () => {
            const metadata = calculatePaginationMetadata(1, 10, 47);
            expect(metadata).toEqual({
                currentPage: 1,
                totalPages: 5,
                totalItems: 47,
                itemsPerPage: 10,
                hasNextPage: true,
                hasPreviousPage: false,
            });
        });

        it("Should calculate correct metadata for last page", () => {
            const metadata = calculatePaginationMetadata(5, 10, 47);
            expect(metadata).toEqual({
                currentPage: 5,
                totalPages: 5,
                totalItems: 47,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: true,
            });
        });

        it("Should handle empty results", () => {
            const metadata = calculatePaginationMetadata(1, 10, 0);
            expect(metadata).toEqual({
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });

        it("Should handle exact page boundary", () => {
            const metadata = calculatePaginationMetadata(2, 10, 20);
            expect(metadata).toEqual({
                currentPage: 2,
                totalPages: 2,
                totalItems: 20,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPreviousPage: true,
            });
        });
    });

    describe("calculateSkip", () => {
        it("Should calculate correct skip for page 1", () => {
            expect(calculateSkip(1, 10)).toBe(0);
        });

        it("Should calculate correct skip for page 2", () => {
            expect(calculateSkip(2, 10)).toBe(10);
        });

        it("Should calculate correct skip for page 5 with limit 20", () => {
            expect(calculateSkip(5, 20)).toBe(80);
        });
    });
});
