import { NextFunction, Request, Response } from "express";
import { cacheMiddleware, invalidateCache } from "./cache.middleware";
import { RedisHelper } from "../config";
import { IApiResponse, IUser } from "../types";

// Mock RedisHelper
jest.mock("../config", () => ({
    RedisHelper: {
        get: jest.fn(),
        set: jest.fn(),
        delPattern: jest.fn(),
    },
}));

describe("cacheMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            originalUrl: "/api/tasks?status=completed",
            user: {
                id: "user-123",
                username: "testuser",
                email: "test@example.com",
            } as IUser,
        };

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };

        mockNext = jest.fn();
    });

    describe("Cache HIT scenarios", () => {
        it("Should return cached data when cache hit occurs", async () => {
            const cachedData = [{ id: "1", title: "Task 1" }];
            const taskMiddleware = cacheMiddleware("tasks", 300);

            (RedisHelper.get as jest.Mock).mockResolvedValue(cachedData);

            await taskMiddleware(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(RedisHelper.get).toHaveBeenCalledWith(
                "tasks:user-123:/api/tasks?status=completed"
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: cachedData,
                cached: true,
                message: "Data retrieved from cache",
            } as IApiResponse);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should use anonymous as userId when user is not authenticated", async () => {
            const cachedData = [{ id: "1", title: "Public Task" }];
            const taskMiddleware = cacheMiddleware("public-tasks", 300);

            mockReq.user = undefined;
            (RedisHelper.get as jest.Mock).mockResolvedValue(cachedData);

            await taskMiddleware(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(RedisHelper.get).toHaveBeenCalledWith(
                "public-tasks:anonymous:/api/tasks?status=completed"
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: cachedData,
                cached: true,
                message: "Data retrieved from cache",
            } as IApiResponse);
        });

        it("Should generate correct cache key with different routes", async () => {
            const cachedData = { id: "1", name: "User" };
            const middleware = cacheMiddleware("users", 300);

            // User id is defined at the top of this file
            mockReq.originalUrl = "/api/users/profile";
            (RedisHelper.get as jest.Mock).mockResolvedValue(cachedData);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(RedisHelper.get).toHaveBeenCalledWith(
                "users:user-123:/api/users/profile"
            );
        });
    });

    describe("Cache MISS scenarios", () => {
        it("Should call next() when no cacheKey is found", async () => {
            const middleware = cacheMiddleware("tasks", 300);
            (RedisHelper.get as jest.Mock).mockResolvedValue(null);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(RedisHelper.get).toHaveBeenCalledWith(
                "tasks:user-123:/api/tasks?status=completed"
            );
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(statusMock).not.toHaveBeenCalled();
        });

        it("Should intercept res.json and cache successful response", async () => {
            const taskMiddleware = cacheMiddleware("tasks", 600);
            const responseData = {
                success: true,
                data: [{ id: "1", title: "Task 1" }],
            };

            (RedisHelper.get as jest.Mock).mockResolvedValue(null);
            (RedisHelper.set as jest.Mock).mockResolvedValue(undefined);

            await taskMiddleware(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            // Wait for async operations
            await new Promise(process.nextTick);

            expect(RedisHelper.set).toHaveBeenCalledWith(
                "tasks:user-123:/api/tasks?status=completed",
                responseData.data,
                600
            );
        });

        it("Should NOT cache unsuccessful responses", async () => {
            const middleware = cacheMiddleware("tasks", 300);
            const responseData = {
                success: false,
                message: "Error occurred",
            };

            (RedisHelper.get as jest.Mock).mockResolvedValue(null);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.set).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });

        it("Should NOT cache responses without data field", async () => {
            const middleware = cacheMiddleware("tasks", 300);
            const responseData = {
                success: true,
                message: "Operation completed",
                // No data field
            };

            (RedisHelper.get as jest.Mock).mockResolvedValue(null);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.set).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });

        it("Should use custom TTL value", async () => {
            const customTTL = 1800; // 30 minutes
            const middleware = cacheMiddleware("tasks", customTTL);
            const responseData = {
                success: true,
                data: [{ id: "1", title: "Task 1" }],
            };

            (RedisHelper.get as jest.Mock).mockResolvedValue(null);
            (RedisHelper.set as jest.Mock).mockResolvedValue(undefined);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller response
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.set).toHaveBeenCalledWith(
                "tasks:user-123:/api/tasks?status=completed",
                responseData.data,
                customTTL
            );
        });

        it("Should use default TTL of 300 seconds when not specified", async () => {
            const middleware = cacheMiddleware("tasks"); // No TTL specified
            const responseData = {
                success: true,
                data: [{ id: "1", title: "Task 1" }],
            };

            (RedisHelper.get as jest.Mock).mockResolvedValue(null);
            (RedisHelper.set as jest.Mock).mockResolvedValue(undefined);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller response
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.set).toHaveBeenCalledWith(
                "tasks:user-123:/api/tasks?status=completed",
                responseData.data,
                300 // Default TTL
            );
        });
    });

    describe("Error handling", () => {
        it("Should call next() when RedisHelper.get throws an error", async () => {
            const middleware = cacheMiddleware("tasks", 300);
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            (RedisHelper.get as jest.Mock).mockRejectedValue(
                new Error("Redis connection failed")
            );

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Cache middleware error: ",
                expect.any(Error)
            );
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(statusMock).not.toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it("Should handle cache save errors gracefully", async () => {
            const middleware = cacheMiddleware("tasks");
            const responseData = {
                success: true,
                data: [{ id: "1", title: "Task 1" }],
            };
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            (RedisHelper.get as jest.Mock).mockResolvedValue(null); // Force cache miss, so we intercept and save on redis

            (RedisHelper.set as jest.Mock).mockRejectedValue(
                new Error("Redis save failed")
            );

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller response
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Cache save error: ",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });
});

describe("invalidateCache", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            user: {
                id: "user-123",
                username: "testuser",
                email: "test@example.com",
            } as IUser,
        };

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };

        mockNext = jest.fn();
    });

    describe("Cache invalidation scenarios", () => {
        it("Should invalidate cache on successful response", async () => {
            const middleware = invalidateCache("tasks");
            const responseData = {
                success: true,
                data: { id: "1", title: "Created Task" },
            };

            (RedisHelper.delPattern as jest.Mock).mockResolvedValue(undefined);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.delPattern).toHaveBeenCalledWith(
                "tasks:user-123"
            );
        });

        it("Should use anonymous userId when user is not authenticated", async () => {
            const middleware = invalidateCache("tasks");
            const responseData = {
                success: true,
                data: { message: "Public task created" },
            };

            mockReq.user = undefined;
            (RedisHelper.delPattern as jest.Mock).mockResolvedValue(undefined);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.delPattern).toHaveBeenCalledWith(
                "tasks:anonymous"
            );
        });

        it("Should NOT invalidate cache on unsuccessful response", async () => {
            const middleware = invalidateCache("tasks");
            const responseData = {
                success: false,
                message: "Failed to create task",
            };

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.delPattern).not.toHaveBeenCalled();
        });

        it("Should generate correct cache pattern for different resources", async () => {
            const middleware = invalidateCache("users");
            const responseData = {
                success: true,
                data: { id: "1", name: "User" },
            };

            (RedisHelper.delPattern as jest.Mock).mockResolvedValue(undefined);

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller calling res.json()
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(RedisHelper.delPattern).toHaveBeenCalledWith(
                "users:user-123"
            );
        });
    });

    describe("Error handling", () => {
        it("Should handle cache invalidation errors gracefully", async () => {
            const middleware = invalidateCache("tasks");
            const responseData = {
                success: true,
                data: { id: "1", title: "Task" },
            };
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            (RedisHelper.delPattern as jest.Mock).mockRejectedValue(
                new Error("Redis delete failed")
            );

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            // Simulate controller response
            const interceptedJson = mockRes.json as jest.Mock;
            interceptedJson(responseData);

            await new Promise(process.nextTick);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Cache invalidation error: ",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it("Should call next() when middleware setup throws an error", async () => {
            const middleware = invalidateCache("tasks");
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            // Force an error by making res.json.bind throw
            mockRes.json = undefined as any;

            await middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Cache validation error",
                expect.any(Error)
            );
            expect(mockNext).toHaveBeenCalledTimes(1);

            consoleErrorSpy.mockRestore();
        });
    });
});
