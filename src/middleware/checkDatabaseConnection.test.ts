import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { checkDatabaseConnection } from "./checkDatabaseConnection";


jest.mock('mongoose', () => ({
    connection: {
        readyState: 0
    }
}));

describe('checkDatabaseConnection middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;


    beforeEach(() => {
        jest.clearAllMocks();
        
        mockRequest = {} // request is updated to be empty
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({
            json: jsonMock
        });

        mockResponse = {
            status: statusMock,
            json: jsonMock
        };
        mockNext = jest.fn();
    });


    describe('DB connection handling', () => {
        it('Should call next() when database is connected', () => {
            // Set readyState directly on the mocked object
            (mongoose.connection as any).readyState = 1;

            checkDatabaseConnection(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('Should return 503 when databse is disconnected', () => {
            (mongoose.connection as any).readyState = 0;
            
            checkDatabaseConnection(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(503);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection not available"
            })
            expect(mockNext).not.toHaveBeenCalled()
        });

        it('Should return 503 when database is connecting', () => {
            (mongoose.connection as any).readyState = 2;
            
            checkDatabaseConnection(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(503);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection not available"
            })
            expect(mockNext).not.toHaveBeenCalled()
        });

        it('Should return 503 when database is disconnecting', () => {
            (mongoose.connection as any).readyState = 3;
            
            checkDatabaseConnection(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(statusMock).toHaveBeenCalledWith(503);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Database connection not available"
            });
            expect(mockNext).not.toHaveBeenCalled();
        })
    })
})