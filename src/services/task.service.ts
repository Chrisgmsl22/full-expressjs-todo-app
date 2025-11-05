import { ITask, ICreateTaskRequest, IUpdateTaskRequest } from "../types";
import { Task } from "../models/task.model";
import mongoose from "mongoose";
import { ValidationError } from "../utils";

export class TaskService {
    public static async getAllTasks(userId: string): Promise<ITask[]> {
        return await Task.find({ userId }); // We need to filter by userId
    }

    public static async getTaskById(
        id: string,
        userId: string
    ): Promise<ITask | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("Invalid ID format");
        }
        return await Task.findOne({ _id: id, userId });
    }

    public static async createTask(
        taskData: ICreateTaskRequest,
        userId: string
    ): Promise<ITask> {
        // Business logic validation
        if (!taskData.title || !taskData.title.trim()) {
            throw new ValidationError("Title is required");
        }

        const newTask = new Task({
            title: taskData.title.trim(),
            description: taskData.description,
            completed: false,
            userId, // This user created this task, and should be the only one seeing this task
        });

        return await newTask.save();
    }

    public static async updateTask(
        id: string,
        updateData: IUpdateTaskRequest,
        userId: string
    ): Promise<ITask | null> {
        if (!id) {
            throw new ValidationError("Id is required");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("Invalid ID format");
        }

        return await Task.findOneAndUpdate({ _id: id, userId }, updateData, {
            new: true,
            runValidators: true,
        });
    }

    public static async deleteTask(
        id: string,
        userId: string
    ): Promise<ITask | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError("Invalid ID format");
        }

        return await Task.findOneAndDelete({ _id: id, userId });
    }
}
