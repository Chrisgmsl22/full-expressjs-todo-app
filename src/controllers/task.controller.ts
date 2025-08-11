import { NextFunction, Request, Response } from "express";
import { IPostTask } from "../models/interfaces";
import { generateStaticPosts } from "../utils";
import mongoose from "mongoose";

const STATIC_POSTS: IPostTask[] = generateStaticPosts();

export class PostController {
    public static async getAllPosts(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.status(200).json(STATIC_POSTS);
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
            const post = STATIC_POSTS.find((p) => p._id === id);

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
            }
            const newPost: IPostTask = {
                _id: new mongoose.Types.ObjectId().toString(),
                title: title,
                completed: completed || false,
                createdAt: new Date(),
            };

            STATIC_POSTS.push(newPost);
            res.status(201).json(newPost);
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
            const postIndex = STATIC_POSTS.findIndex((p) => p._id === id);

            if (postIndex === -1) {
                res.status(404).json({ message: "Post was not found" });
                return;
            }

            STATIC_POSTS.splice(postIndex, 1);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
