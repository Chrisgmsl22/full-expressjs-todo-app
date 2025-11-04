import { NextFunction, Request, Response } from "express";
import { IApiResponse, IAuthResponse, IRegisterRequest, IUser } from "../types";
import { AuthService } from "../services/auth.service";
import { UserController } from "./user.controller";

// Mock service layer
jest.mock("../services/auth.service");

describe("UserController", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {};
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };

        mockNext = jest.fn();
    });

    describe("register", () => {
        it("Should return 201 for a created user", async () => {
            const createdUser = {
                id: "user-id-123",
                username: "myUsername123",
                password: "#jhfghjgvtvitv",
                email: "myEmail@test.com",
                createdAt: new Date(),
                emailVerified: false,
                isActive: true,
                lastLoginAt: new Date(),
            } as IUser;
            const mockJwt = "mock-jwt-123456789";

            (AuthService.createUser as jest.Mock).mockResolvedValue(
                createdUser
            );
            (AuthService.generateToken as jest.Mock).mockReturnValue(mockJwt);

            mockReq.body = {
                username: "myUsername123",
                email: "myEmail@test.com",
                password: "WeWork441$",
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.createUser).toHaveBeenCalledTimes(1);
            expect(AuthService.createUser).toHaveBeenCalledWith({
                username: mockReq.body.username,
                email: mockReq.body.email.toLowerCase(),
                password: mockReq.body.password,
            } as IRegisterRequest);
            expect(AuthService.generateToken).toHaveBeenCalledTimes(1);
            expect(AuthService.generateToken).toHaveBeenCalledWith(createdUser);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "User registered successfully",
                data: {
                    id: createdUser.id,
                    username: createdUser.username,
                    email: createdUser.email,
                    createdAt: createdUser.createdAt,
                },
                token: mockJwt,
            } as IAuthResponse);
        });

        it("Should return 400 if username is missing", async () => {
            mockReq.body = {
                email: "myEmail@test.com",
                password: "myPassword123",
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.createUser).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message:
                    "username, email and password are required and must be strings",
            } as IApiResponse);
        });

        it("Should return 400 if email is missing", async () => {
            mockReq.body = {
                username: "usernameData",
                password: "myPassword123",
                //email: ""
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.createUser).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message:
                    "username, email and password are required and must be strings",
            } as IApiResponse);
        });

        it("Should return 400 if password is missing", async () => {
            mockReq.body = {
                username: "usernameData",
                //password: "myPassword123",
                email: "myEmail@test.com",
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.createUser).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message:
                    "username, email and password are required and must be strings",
            } as IApiResponse);
        });

        it("Should return 400 if username is not a string", async () => {
            mockReq.body = {
                username: 12345,
                password: "myPassword123",
                email: "myEmail@test.com",
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.createUser).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message:
                    "username, email and password are required and must be strings",
            } as IApiResponse);
        });

        it("Should call next() with error when service throws", async () => {
            const mockError = new Error("Database connection failed");

            (AuthService.createUser as jest.Mock).mockRejectedValue(mockError);

            mockReq.body = {
                username: "validUser",
                email: "valid@test.com",
                password: "ValidPass123",
            };

            await UserController.register(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockError);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("Should return 200 for a logged in user", async () => {
            const existingUser = {
                id: "user-id-123456789",
                username: "usernameHere",
                email: "email@test.com",
                password: "#asdfghjkl",
                createdAt: new Date(),
                emailVerified: false,
                isActive: true,
                lastLoginAt: new Date(),
            } as IUser;
            const mockJwt = "mock-jwt-123456789";

            (AuthService.validateLogin as jest.Mock).mockResolvedValue(
                existingUser
            );
            (AuthService.generateToken as jest.Mock).mockReturnValue(mockJwt);

            mockReq.body = {
                email: "email@test.com",
                password: "WeWork441$$$",
            };

            await UserController.login(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.validateLogin).toHaveBeenCalledTimes(1);
            expect(AuthService.validateLogin).toHaveBeenCalledWith(
                mockReq.body.email,
                mockReq.body.password
            );
            expect(AuthService.generateToken).toHaveBeenCalledTimes(1);
            expect(AuthService.generateToken).toHaveBeenCalledWith(
                existingUser
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "User logged in successfully",
                user: {
                    id: existingUser.id,
                    username: existingUser.username,
                    email: existingUser.email,
                    createdAt: existingUser.createdAt,
                },
                token: mockJwt,
            } as IAuthResponse);
        });

        it("Should return 400 if email is missing", async () => {
            mockReq.body = { password: "WeWork441$" };

            await UserController.login(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "email and password are required and must be strings",
            } as IApiResponse);
            expect(AuthService.validateLogin).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
        });

        it("Should return 400 if password is missing is missing", async () => {
            mockReq.body = {
                // password: "WeWork441$",
                email: "email@test.com",
            };

            await UserController.login(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "email and password are required and must be strings",
            } as IApiResponse);
            expect(AuthService.validateLogin).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
        });

        it("Should return 400 if email is not a string", async () => {
            mockReq.body = {
                // password: "WeWork441$",
                email: 12345,
            };

            await UserController.login(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "email and password are required and must be strings",
            } as IApiResponse);
            expect(AuthService.validateLogin).not.toHaveBeenCalled();
            expect(AuthService.generateToken).not.toHaveBeenCalled();
        });

        it("Should call next() when Service errors out", async () => {
            const mockErr = new Error("Something unexpected happened");
            (AuthService.validateLogin as jest.Mock).mockRejectedValue(mockErr);

            mockReq.body = {
                password: "WeWork441$",
                email: "email@test.com",
            };

            await UserController.login(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(mockErr);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        it("Should return 200 when loggin out", async () => {
            const mockLogoutRes = {
                success: true,
                message:
                    "Logged out successfully!. Please remove token from client",
            } as IApiResponse;
            (AuthService.logout as jest.Mock).mockReturnValue(mockLogoutRes);

            await UserController.logout(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AuthService.logout).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockLogoutRes);
        });

        it("Should call middleware function if the service errors out", async () => {
            // Dont feel like we really need to test this
            const mockErr = new Error("Something unexpected happened");
            (AuthService.logout as jest.Mock).mockImplementation(() => {
                throw mockErr;
            });

            await UserController.logout(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockErr);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });
});
