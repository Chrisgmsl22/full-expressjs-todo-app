import { NextFunction, Request, Response } from "express"
import { AccountDeactivationError, AuthenticationError, ConflictError, UserNotFoundError, ValidationError } from "../utils";
import { errorHandler } from "./errorHandler";


describe('errorHandler middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {};
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({json: jsonMock});
        
        mockResponse = {
            status: statusMock
        };
        mockNext = jest.fn();
    })

    describe('AppError handling', () => {
        it('Should handle ValidationError with correct status code', () => {
            const err = new ValidationError("Invalid email format");

            // We call this middleware function, and give it all necessary params
            errorHandler(
                err,
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Invalid email format"
            });
            
        });

        it('Should handle ConflictError with correct status code', () => {
            const err = new ConflictError("User already exists");

            // We call this middleware function, and give it all necessary params
            errorHandler(
                err,
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "User already exists"
            });
            
        });

        it('Should handle AuthenticationError with correct status code', () => {
            const err = new AuthenticationError("Authentication failed");

            // We call this middleware function, and give it all necessary params
            errorHandler(
                err,
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Authentication failed"
            });
            
        });

        it('Should handle AccountDeactivationError with correct status code', () => {
            const err = new AccountDeactivationError("Account is deactivated");

            // We call this middleware function, and give it all necessary params
            errorHandler(
                err,
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Account is deactivated"
            });
            
        });

        it('Should handle UserNotFoundError with correct status code', () => {
            const err = new UserNotFoundError("User not found");

            // We call this middleware function, and give it all necessary params
            errorHandler(
                err,
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "User not found"
            });
            
        });
    })
})