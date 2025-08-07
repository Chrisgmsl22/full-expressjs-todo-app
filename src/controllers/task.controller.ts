import { NextFunction, Request, Response } from "express";
import { IPostTask } from "../models/interfaces";
import { generateStaticPosts } from "../utils";

export class PostController {
    public static async getAllPosts(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const staticPosts: IPostTask[] = generateStaticPosts();

        try {
            res.status(200).json(staticPosts);
        } catch (err) {
            next(err);
        }
    }

    public static async getPostById() {}

    public static async createPost() {}

    public static async deletePost() {}
}
