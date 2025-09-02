import { NextFunction, Request, Response } from "express";
import { IApiResponse } from "../types";
import { TaskService } from "../services/task.service";

export class TaskController {
    public static async getAllTasks(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // 1. Call service to get all tasks
            const tasks = await TaskService.getAllTasks();

            // 2. Return formatted response
            res.status(200).json({
                success: true,
                data: tasks,
                message: "Tasks retrieved successfully",
            } as IApiResponse);
        } catch (err) {
            next(err);
        }
    }

    public static async getTaskById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            // 1. Call service to get task
            const task = await TaskService.getTaskById(id);

            // 2. Handle not found case
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: "Task not found",
                } as IApiResponse);
                return;
            }

            // 3. Return formatted response
            res.status(200).json({
                success: true,
                data: task,
                message: "Task retrieved successfully",
            } as IApiResponse);
        } catch (err) {
            next(err);
        }
    }

    public static async createTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { title, description } = req.body;

            // 1. Basic input validation (HTTP layer concern)
            if (!title || typeof title !== "string") {
                res.status(400).json({
                    success: false,
                    error: "Title is required and must be a string",
                } as IApiResponse);
                return;
            }

            // 2. Call service to create task
            const newTask = await TaskService.createTask({
                title,
                description,
            });

            // 3. Return formatted response
            res.status(201).json({
                success: true,
                data: newTask,
                message: "Task created successfully",
            } as IApiResponse);
        } catch (err) {
            next(err);
        }
    }

    public static async updateTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // 1. Call service to update task
            const updatedTask = await TaskService.updateTask(id, updateData);

            // 2. Handle not found case
            if (!updatedTask) {
                res.status(404).json({
                    success: false,
                    error: "Task not found",
                } as IApiResponse);
                return;
            }

            // 3. Return formatted response
            res.status(200).json({
                success: true,
                data: updatedTask,
                message: "Task updated successfully",
            } as IApiResponse);
        } catch (err) {
            next(err);
        }
    }

    public static async deleteTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            // 1. Call service to delete task
            const deletedTask = await TaskService.deleteTask(id);

            // 2. Handle not found case
            if (!deletedTask) {
                res.status(404).json({
                    success: false,
                    error: "Task not found",
                } as IApiResponse);
                return;
            }

            // 3. Return success response (no content)
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}
