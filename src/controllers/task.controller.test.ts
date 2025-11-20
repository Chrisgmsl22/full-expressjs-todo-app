import { NextFunction, Request, Response } from "express";
import { generateStaticPosts } from "../utils";
import { TaskService } from "../services/task.service";
import { TaskController } from "./task.controller";
import { IApiResponse, ITask, ITasksPaginatedResult, IUser } from "../types";
import mongoose from "mongoose";

// We need to Mock the TaskService
jest.mock("../services/task.service");

const generateMongoDBId = () => new mongoose.Types.ObjectId().toString();

describe("TaskController", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    const mockUser: IUser = {
        id: generateMongoDBId(),
        username: "mockUsername",
        email: "mockEmail@test.com",
        password: "#ThisShouldBeAHash",
        createdAt: new Date(),
        isActive: false,
        emailVerified: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {};
        mockReq.user = mockUser;
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };

        mockNext = jest.fn();
    });

    describe("getAllTasks", () => {
        it("Should return all tasks with 200 status (default pagination)", async () => {
            const mockTasks = generateStaticPosts();
            const mockResolvedValue = {
                tasks: mockTasks,
                total: mockTasks.length,
            } as ITasksPaginatedResult;

            // Set up query params (empty for defaults)
            mockReq.query = {};

            // Mock the service method
            (TaskService.getAllTasksPaginated as jest.Mock).mockResolvedValue(
                mockResolvedValue
            );

            await TaskController.getAllTasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.getAllTasksPaginated).toHaveBeenCalledTimes(1);
            expect(TaskService.getAllTasksPaginated).toHaveBeenCalledWith(
                mockUser.id,
                1, // default page
                10 // default limit
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockTasks,
                pagination: {
                    currentPage: 1,
                    totalPages: Math.ceil(mockTasks.length / 10),
                    totalItems: mockTasks.length,
                    itemsPerPage: 10,
                    hasNextPage: mockTasks.length > 10,
                    hasPreviousPage: false,
                },
                message: `Retrieved ${mockTasks.length} tasks (page 1 of ${Math.ceil(mockTasks.length / 10)})`,
            });
        });

        it("Should return tasks with custom pagination params", async () => {
            const mockTasks = generateStaticPosts().slice(0, 5); // 5 tasks
            const mockResolvedValue = {
                tasks: mockTasks,
                total: 25, // Total in DB
            } as ITasksPaginatedResult;

            // Set up custom query params
            mockReq.query = { page: "3", limit: "5" };

            (TaskService.getAllTasksPaginated as jest.Mock).mockResolvedValue(
                mockResolvedValue
            );

            await TaskController.getAllTasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.getAllTasksPaginated).toHaveBeenCalledWith(
                mockUser.id,
                3, // page 3
                5 // limit 5
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockTasks,
                pagination: {
                    currentPage: 3,
                    totalPages: 5, // 25 total / 5 per page
                    totalItems: 25,
                    itemsPerPage: 5,
                    hasNextPage: true,
                    hasPreviousPage: true,
                },
                message: "Retrieved 5 tasks (page 3 of 5)",
            });
        });

        it("Should call next() with error if service throws one", async () => {
            const mockError = new Error("Database error");

            // Set up query params
            mockReq.query = {};

            (TaskService.getAllTasksPaginated as jest.Mock).mockRejectedValue(
                mockError
            );

            await TaskController.getAllTasks(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockError);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("getTaskById", () => {
        it("Should return task with 200 status", async () => {
            const retrievedTask = {
                title: "existing task",
                _id: "123456789",
                completed: false,
            } as ITask;

            (TaskService.getTaskById as jest.Mock).mockResolvedValue(
                retrievedTask
            );

            // Make sure to set params in order to actually make the call
            mockReq.params = { id: "123" };

            await TaskController.getTaskById(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.getTaskById).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: retrievedTask,
                message: "Task retrieved successfully",
            } as IApiResponse);
        });

        it("Should return 404 when task not found", async () => {
            (TaskService.getTaskById as jest.Mock).mockResolvedValue(null);

            mockReq.params = { id: "123" };
            await TaskController.getTaskById(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.getTaskById).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Task not found",
            } as IApiResponse);
        });

        it("Should pass errors to next middleware", async () => {
            const mockError = new Error("Service error");
            (TaskService.getTaskById as jest.Mock).mockRejectedValue(mockError);

            mockReq.params = { id: "123" };
            await TaskController.getTaskById(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockError);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("createTask", () => {
        it("Should return task with 201 status", async () => {
            const createdTask: ITask = {
                title: "My task",
                description: "My description",
                completed: false,
                createdAt: new Date(),
            };
            (TaskService.createTask as jest.Mock).mockResolvedValue(
                createdTask
            );

            mockReq.body = { title: "My task", description: "My description" };

            await TaskController.createTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.createTask).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: createdTask,
                message: "Task created successfully",
            } as IApiResponse);
        });

        it("Should return 400 if title is not provided", async () => {
            mockReq.body = {}; // Notice how we are not adding a title to the req body

            await TaskController.createTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Title is required and must be a string",
            } as IApiResponse);
        });

        it("Should return 400 if title not a string", async () => {
            mockReq.body = { title: 12345 };

            await TaskController.createTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Title is required and must be a string",
            } as IApiResponse);
        });

        it("Should call next middleware function if an error occurs", async () => {
            const error = new Error("Something wrong happened");
            (TaskService.createTask as jest.Mock).mockRejectedValue(error);

            mockReq.body = {
                title: "Valid title",
                description: "Valid description",
            };

            await TaskController.createTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("updateTask", () => {
        it("Should update an existing task", async () => {
            const updatedTask: ITask = {
                _id: "task-id-123",
                title: "updated",
                description: "updated description",
                completed: false,
                createdAt: new Date(),
            };
            (TaskService.updateTask as jest.Mock).mockResolvedValue(
                updatedTask
            );

            mockReq.params = { id: updatedTask._id! };
            mockReq.body = {
                title: "updated",
                description: "updated description",
            };

            await TaskController.updateTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.updateTask).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: updatedTask,
                message: "Task updated successfully",
            } as IApiResponse);
        });

        it("Should return 404 if task is not found", async () => {
            (TaskService.updateTask as jest.Mock).mockResolvedValue(null);

            mockReq.params = { id: "123456" };
            mockReq.body = { title: "update title" };

            await TaskController.updateTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.updateTask).toHaveBeenCalledTimes(1);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Task not found",
            } as IApiResponse);
        });

        it("Should call next middleware function when an error occurs", async () => {
            const mockErr = new Error("Something unexpected happened");
            (TaskService.updateTask as jest.Mock).mockRejectedValue(mockErr);

            mockReq.params = { id: "123456" };
            mockReq.body = { title: "update title" };

            await TaskController.updateTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(mockErr);
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe("deleteTask", () => {
        it("Should delete task and return 204", async () => {
            const deletedTask = {
                _id: "task-id-123",
                title: "My old task",
                completed: true,
                createdAt: new Date(),
                // ...
            } as ITask;
            (TaskService.deleteTask as jest.Mock).mockResolvedValue(
                deletedTask
            );

            mockReq.params = { id: "task-id-123" };

            await TaskController.deleteTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.deleteTask).toHaveBeenCalledTimes(1);
            expect(TaskService.deleteTask).toHaveBeenCalledWith(
                mockReq.params.id,
                mockUser.id
            );
            expect(statusMock).toHaveBeenCalledWith(204);
        });

        it("Should return 404 if task is not found", async () => {
            (TaskService.deleteTask as jest.Mock).mockResolvedValue(null);

            mockReq.params = { id: "task-id-123" };

            await TaskController.deleteTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.deleteTask).toHaveBeenCalledTimes(1);
            expect(TaskService.deleteTask).toHaveBeenCalledWith(
                mockReq.params.id,
                mockUser.id
            );
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "Task not found",
            } as IApiResponse);
        });

        it("Should call next middleware function when an error occurs", async () => {
            const mockError = new Error("Something unexpected happened");
            (TaskService.deleteTask as jest.Mock).mockRejectedValue(mockError);

            mockReq.params = { id: "task-id-123" };

            await TaskController.deleteTask(
                mockReq as Request,
                mockRes as Response,
                mockNext as NextFunction
            );

            expect(TaskService.deleteTask).toHaveBeenCalledTimes(1);
            expect(TaskService.deleteTask).toHaveBeenCalledWith(
                mockReq.params.id,
                mockUser.id
            );
            expect(mockNext).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });
    });
});
