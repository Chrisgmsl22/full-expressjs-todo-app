import { NextFunction, Request, Response } from "express";
import { AIService } from "../services/ai.service";
import { AIController } from "./ai.controller";
import { IApiResponse } from "../types";

// Mock the entire AIService module - this replaces all methods with jest.fn()
jest.mock("../services/ai.service");

describe("AI Controller", () => {
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

    describe("generateSubtasks", () => {
        it("Should return an array of subtasks with 200 status", async () => {
            const mockAiResponse = [
                "Learn algorithms",
                "Find one programming language",
                "practice easy problems",
                "look for a mentor",
                "start building a personal project",
            ];

            // This is our request we're sending
            mockReq.body = { taskDescription: "Learn programming" };

            // Mock our AI service method and return static info
            (AIService.generateSubtasks as jest.Mock).mockResolvedValue(
                mockAiResponse
            );

            await AIController.generateSubtasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AIService.generateSubtasks).toHaveBeenCalledTimes(1);
            expect(AIService.generateSubtasks).toHaveBeenCalledWith(
                "Learn programming"
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: "Subtasks generated successfully",
                data: mockAiResponse,
            } as IApiResponse);
        });

        it("Should return 400 if no description is provided", async () => {
            mockReq.body = {};
            // Calling method directly, without setting the request body
            await AIController.generateSubtasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(AIService.generateSubtasks).not.toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Task description was not provided",
            } as IApiResponse);
        });

        it("Should call next() with error if service throws one", async () => {
            const mockErr = new Error("You ran out of credits");

            mockReq.body = { taskDescription: "Learn a new language" };

            (AIService.generateSubtasks as jest.Mock).mockRejectedValue(
                mockErr
            );

            await AIController.generateSubtasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockErr);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });
});
