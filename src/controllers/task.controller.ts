import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/task.model";

export class PostController {
    public static async getAllPosts(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // use Mongoose to find all tasks
            const tasks = await Task.find();
            res.status(200).json(tasks);
        } catch (err) {
            next(err);
        }
    }

    public static async getPostById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            // Check if the ID is valid in the first place
            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    message: "Invalid ID format",
                });
                return;
            }
            const post = await Task.findById(id);

            if (!post) {
                res.status(404).json({ message: "Post was not found" });
                return;
            }

            res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    }

    public static async createPost(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { title, completed } = req.body;

            // Validation to make sure these types are valid
            if (typeof title !== "string" || !title.trim()) {
                const errJsonMessage = {
                    message: "Title is required and must be of type string",
                };
                res.status(400).json(errJsonMessage);
                return;
            }

            if (completed !== undefined && typeof completed !== "boolean") {
                const errMessage = {
                    message: "Completed must be boolean",
                };
                res.status(400).json(errMessage);
                return;
            }
            const newTask = new Task({
                title: title.trim(),
                completed: completed || false,
                // createdAt: new Date(), Will be set automatically by the schema
            });

            // Save to the DB
            const savedTask = await newTask.save();
            res.status(201).json(savedTask);
        } catch (err) {
            next(err);
        }
    }

    public static async deletePost(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    message: "Invalid ID format",
                });
                return;
            }

            const post = await Task.findByIdAndDelete(id);

            if (!post) {
                res.status(404).json({ message: "Post was not found" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
