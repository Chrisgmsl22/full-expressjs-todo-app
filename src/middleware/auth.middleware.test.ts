import { NextFunction, Request, Response } from "express";
import { ITokenVerificationResult, IUser } from "../types";
import { AuthService } from "../services/auth.service";
import { authenticateJWT } from "./auth.middleware";
import { AuthenticationError, UserNotFoundError } from "../utils";

// First, let's mock the AuthService
jest.mock("../services/auth.service");

describe("authenticateJWT middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create fresh mock objects for each test
        mockRequest = {
            headers: {},
        };
        mockResponse = {};
        mockNext = jest.fn();
    });

    describe("Token validation", () => {
        it("Should successfully authenticate with valid token", async () => {
            const mockUserFound = {
                id: "123",
                email: "test@example.com",
                username: "testuser",
                password: "hashed",
                isActive: true,
                emailVerified: false,
                createdAt: new Date(),
            } as IUser;

            const mockVerifiedTokenResult = {
                valid: true,
                payload: {
                    userId: "123",
                    email: "test@example.com",
                    username: "testUser",
                },
            } as ITokenVerificationResult;

            mockRequest.headers = {
                authorization: "Bearer this-is-a-valid-token",
            };

            (AuthService.verifyToken as jest.Mock).mockReturnValue(
                mockVerifiedTokenResult
            );

            (AuthService.findUserById as jest.Mock).mockResolvedValue(
                mockUserFound
            );

            await authenticateJWT(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(AuthService.verifyToken).toHaveBeenCalledWith(
                "this-is-a-valid-token"
            );
            expect(AuthService.findUserById).toHaveBeenCalledWith("123");
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.email).toBe("test@example.com");
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it("Should throw AuthenticationError when no auth header is provided", async () => {
            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow(AuthenticationError);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow("Could not validate token");
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should throw AuthenticationError when header does not start with Bearer", async () => {
            mockRequest.headers = {
                authorization: "",
            };
            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow(AuthenticationError);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow("Could not validate token");
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should throw AuthenticationError for invalid token", async () => {
            mockRequest.headers = {
                authorization: "Bearer invalid-token", // First part if the auth header needs to be valid so we don't trigger the first validation
            };
            const mockVerifyTokenResult = {
                valid: false,
                payload: {},
                error: "Invalid token",
            } as ITokenVerificationResult;

            (AuthService.verifyToken as jest.Mock).mockReturnValue(
                mockVerifyTokenResult
            );

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow(AuthenticationError);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow("Invalid token");

            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should throw AuthenticationError for expired token", async () => {
            mockRequest.headers = {
                authorization: "Bearer expired-token", // First part if the auth header needs to be valid so we don't trigger the first validation
            };
            const mockVerifyTokenResult = {
                valid: false,
                payload: {},
                error: "Expired token",
            } as ITokenVerificationResult;

            (AuthService.verifyToken as jest.Mock).mockReturnValue(
                mockVerifyTokenResult
            );

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow(AuthenticationError);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow("Expired token");

            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should throw UserNotFoundError when user does not exist", async () => {
            mockRequest.headers = {
                authorization: "Bearer valid-token",
            };

            const mockVerifiedTokenResult = {
                valid: true,
                payload: {
                    userId: "non-existent-user",
                    email: "test@example.com",
                    username: "testUser",
                },
            } as ITokenVerificationResult;

            (AuthService.verifyToken as jest.Mock).mockReturnValue(
                mockVerifiedTokenResult
            );
            (AuthService.findUserById as jest.Mock).mockResolvedValue(null);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow(UserNotFoundError);

            await expect(
                authenticateJWT(
                    mockRequest as Request,
                    mockResponse as Response,
                    mockNext
                )
            ).rejects.toThrow("User not found");

            expect(mockNext).not.toHaveBeenCalled();
        });

        it("Should extract token correctly by removing Bearer prefix", async () => {
            const token = "my-valid-token";
            mockRequest.headers = {
                authorization: `Bearer ${token}`,
            };

            const mockVerifyTokenResult = {
                valid: true,
                payload: {
                    userId: "123",
                    email: "example@test.com",
                    username: "userName",
                },
            } as ITokenVerificationResult;

            const mockFindUserByIdResult = {
                id: "123",
                email: "example@test.com",
                // ...
            } as IUser;

            (AuthService.verifyToken as jest.Mock).mockReturnValue(
                mockVerifyTokenResult
            );
            (AuthService.findUserById as jest.Mock).mockResolvedValue(
                mockFindUserByIdResult
            );

            await authenticateJWT(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(AuthService.verifyToken).toHaveBeenCalledWith(token);
        });
    });
});
