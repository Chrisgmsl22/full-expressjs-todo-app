import { ITask, ICreateTaskRequest, IUpdateTaskRequest } from "../types";
import { Task } from "../models/task.model";
import mongoose from "mongoose";
import { ValidationError } from "../utils";

export class TaskService {
    public static async getAllTasks(): Promise<ITask[]> {
        return await Task.find();
    }

    public static async getTaskById(id: string): Promise<ITask | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("Invalid ID format");
        }
        return await Task.findById(id);
    }

    public static async createTask(
        taskData: ICreateTaskRequest
    ): Promise<ITask> {
        // Business logic validation
        if (!taskData.title || !taskData.title.trim()) {
            throw new ValidationError("Title is required");
        }

        const newTask = new Task({
            title: taskData.title.trim(),
            description: taskData.description,
            completed: false,
        });

        return await newTask.save();
    }

    public static async updateTask(
        id: string,
        updateData: IUpdateTaskRequest
    ): Promise<ITask | null> {
        if (!id) {
            throw new ValidationError('Id is required')
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("Invalid ID format");
        }

        return await Task.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    }

    public static async deleteTask(id: string): Promise<ITask | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid ID format");
        }

        return await Task.findByIdAndDelete(id);
    }
}
