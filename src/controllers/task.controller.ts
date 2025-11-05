import { NextFunction, Request, Response } from "express";
import { IApiResponse } from "../types";
import { TaskService } from "../services/task.service";

export class TaskController {
    public static async getAllTasks(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // 1. Call service to get all tasks
            const userId = req.user!.id; // This will be from the authenticated token
            const tasks = await TaskService.getAllTasks(userId);

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
            const userId = req.user!.id;
            const task = await TaskService.getTaskById(id, userId);

            // 2. Handle not found case
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: "Task not found",
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
            const userId = req.user!.id;
            const { title, description } = req.body;

            // 1. Basic input validation (HTTP layer concern)
            if (!title || typeof title !== "string") {
                res.status(400).json({
                    success: false,
                    message: "Title is required and must be a string",
                } as IApiResponse);
                return;
            }

            // 2. Call service to create task
            const newTask = await TaskService.createTask(
                {
                    title,
                    description,
                },
                userId
            );

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
            const userId = req.user!.id;
            const { id } = req.params;
            const updateData = req.body;

            // 1. Call service to update task
            const updatedTask = await TaskService.updateTask(
                id,
                updateData,
                userId
            );

            // 2. Handle not found case
            if (!updatedTask) {
                res.status(404).json({
                    success: false,
                    message: "Task not found",
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
            const userId = req.user!.id;
            const { id } = req.params;

            // 1. Call service to delete task
            const deletedTask = await TaskService.deleteTask(id, userId);

            // 2. Handle not found case
            if (!deletedTask) {
                res.status(404).json({
                    success: false,
                    message: "Task not found",
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
