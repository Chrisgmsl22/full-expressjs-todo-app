import mongoose from "mongoose";
import { Task as TaskModel } from "../models/task.model";
import { ICreateTaskRequest, ITask, IUpdateTaskRequest } from "../types";
import { generateStaticPosts, ValidationError } from "../utils";
import { TaskService } from "./task.service";

// Mock the TaskModel to avoid database calls
jest.mock("../models/task.model");

describe("TaskService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getAllTasks", () => {
        it("Should return all current posts", async () => {
            const mockTasks = generateStaticPosts();
            (TaskModel.find as jest.Mock).mockResolvedValue(mockTasks); // Will have many posts

            const res = await TaskService.getAllTasks();

            expect(res).toBeTruthy();
            expect(TaskModel.find).toHaveBeenCalledTimes(1);
            expect(res).toHaveLength(mockTasks.length); // Make sure there are posts returned

            // Testing the structure of the object returned
            expect(res[0]).toHaveProperty("_id");
            expect(res[0]).toHaveProperty("title");
            expect(res[0]).toHaveProperty("description");
            expect(res[0]).toHaveProperty("completed");
            expect(res[0]).toHaveProperty("createdAt");
            expect(res[0]).toHaveProperty("updatedAt");
            expect(res[0]).toHaveProperty("userId");
        });

        it("Should return empty array if there are no posts", async () => {
            (TaskModel.find as jest.Mock).mockResolvedValue([]);

            const res = await TaskService.getAllTasks();

            expect(res).toHaveLength(0);
            expect(TaskModel.find).toHaveBeenCalledTimes(1);
        });
    });

    describe("getTaskById", () => {
        it("Should return existing task", async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const mockTask = {
                _id: id,
                title: "Work on unit testing!",
                description: "Improve testing skills by just practicing",
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as ITask;
            (TaskModel.findById as jest.Mock).mockResolvedValue(mockTask);

            const existingTask = await TaskService.getTaskById(id);

            expect(existingTask).toBeDefined();
            expect(TaskModel.findById).toHaveBeenCalled();
            expect(existingTask?._id).toBe(id);
            expect(existingTask).toMatchObject({
                _id: expect.any(String),
                title: expect.any(String),
                completed: expect.any(Boolean),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            } as ITask);
        });

        it("Should return null if no ID is found", async () => {
            (TaskModel.findById as jest.Mock).mockResolvedValue(null);

            const id = new mongoose.Types.ObjectId().toString();
            const res = await TaskService.getTaskById(id);

            expect(res).toBeNull();
        });

        it("Should throw ValidationError for invalid ID", async () => {
            (TaskModel.findById as jest.Mock).mockResolvedValue(null); // Doesn't matter the result in this case

            await expect(TaskService.getTaskById("invalidID")).rejects.toThrow(
                ValidationError
            );
            await expect(TaskService.getTaskById("invalidID")).rejects.toThrow(
                "Invalid ID format"
            );
        });
    });

    describe("createTask", () => {
        it("Should successfully create a new task", async () => {
            // For new task and task.save we need to mock both the constructor and the save function
            const taskData = {
                title: "New task",
                description: "Unit testing the create task service method",
            } as ICreateTaskRequest;

            // What we expect to get back after saving
            const mockSavedTask = {
                _id: new mongoose.Types.ObjectId().toString(),
                title: "New task",
                description: "Unit testing the create task service method",
                completed: false,
                createdAt: new Date(),
            } as ITask;

            // Create a mock save function
            const mockSave = jest.fn().mockResolvedValue(mockSavedTask);

            // Replace TaskModel with our mock
            (TaskModel as unknown as jest.Mock).mockImplementation(() => ({
                save: mockSave,
            }));

            const res = await TaskService.createTask(taskData);

            expect(res).toBeDefined();
            expect(res.title).toBe("New task");
            expect(res.completed).toBe(false);
            expect(mockSave).toHaveBeenCalledTimes(1);
        });

        it("Should return ValidationError when title it not passed in", async () => {
            await expect(
                TaskService.createTask({} as ICreateTaskRequest)
            ).rejects.toThrow(ValidationError);
            await expect(
                TaskService.createTask({} as ICreateTaskRequest)
            ).rejects.toThrow("Title is required");
            expect(TaskModel).not.toHaveBeenCalled();
        });
    });

    describe("updateTask", () => {
        it("Should update existing task", async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const updateData = {
                title: "Title updated",
                description: "Description updated",
                completed: true,
            } as IUpdateTaskRequest;

            const mockUpdatedTask = {
                _id: id,
                title: "Title updated",
                description: "Original description",
                completed: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (TaskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(
                mockUpdatedTask
            );

            const res = await TaskService.updateTask(id, updateData);

            expect(res).toBeDefined();
            expect(res?.title).toBe("Title updated");
            expect(res?.completed).toBe(true);
            expect(TaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );
            expect(TaskModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        });

        it("Should throw a ValidationError when id is not given in the function", async () => {
            await expect(
                TaskService.updateTask("", {} as IUpdateTaskRequest)
            ).rejects.toThrow(ValidationError);
            await expect(
                TaskService.updateTask("", {} as IUpdateTaskRequest)
            ).rejects.toThrow("Id is required");
        });

        it("Should throw a ValidationError when ID is invalid", async () => {
            await expect(
                TaskService.updateTask("123", {} as IUpdateTaskRequest)
            ).rejects.toThrow(ValidationError);
            await expect(
                TaskService.updateTask("123", {} as IUpdateTaskRequest)
            ).rejects.toThrow("Invalid ID format");
        });

        it("Should return null when task not found", async () => {
            const taskID = new mongoose.Types.ObjectId().toString();
            const updatedData = {
                title: "Updated title",
            } as IUpdateTaskRequest;

            (TaskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            const res = await TaskService.updateTask(taskID, updatedData);

            expect(res).toBeNull();
            expect(TaskModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        });

        it("Should update only provided fields (partial update)", async () => {
            const taskId = "507f1f77bcf86cd799439011";
            const updateData = { completed: true }; // Only updating completed

            const mockTask = {
                _id: taskId,
                title: "Original Title", // Should stay the same
                description: "Original Description",
                completed: true, // Updated
            };

            (TaskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(
                mockTask
            );

            const result = await TaskService.updateTask(taskId, updateData);

            expect(result?.title).toBe("Original Title");
            expect(result?.completed).toBe(true);
            expect(TaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId,
                { completed: true }, // Only this was sent
                { new: true, runValidators: true }
            );
        });
    });

    describe("deleteTask", () => {
        it("Should delete task", async () => {
            const taskId = new mongoose.Types.ObjectId().toString();

            const taskDeletedMock = {
                _id: taskId,
                title: "Old task",
                description: "Should delete this after finishing",
                completed: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: "someUserId",
            } as ITask;

            (TaskModel.findByIdAndDelete as jest.Mock).mockResolvedValue(
                taskDeletedMock
            );

            const res = await TaskService.deleteTask(taskId);

            expect(res).toBeDefined();
            expect(res?._id).toBe(taskId);
            expect(res?.title).toBe("Old task");
            expect(TaskModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
            // expect(TaskModel.findByIdAndDelete).toHaveBeenCalledWith()
        });

        it("Should throw ValidationError for invalid ID", async () => {
            const invalidId = "invalid-id";

            await expect(TaskService.deleteTask(invalidId)).rejects.toThrow(
                ValidationError
            );
            await expect(TaskService.deleteTask(invalidId)).rejects.toThrow(
                "Invalid ID format"
            );
        });

        it("Should return null for an ID not found", async () => {
            const id = new mongoose.Types.ObjectId().toString();

            (TaskModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            const res = await TaskService.deleteTask(id);

            expect(res).toBeNull();
            expect(TaskModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
        });
    });
});
