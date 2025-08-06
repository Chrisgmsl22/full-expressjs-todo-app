import { NextFunction, Request, Response } from "express";

export class PostController {
    public static async getAllPosts(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {}

    public static async getPostById() {}

    public static async createPost() {}
}
