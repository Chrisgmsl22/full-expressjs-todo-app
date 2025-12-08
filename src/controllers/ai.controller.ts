import { NextFunction, Request, Response } from "express";
import { AIService } from "../services/ai.service";
import { IApiResponse } from "../types";

export class AIController {
    public static async generateSubtasks(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { taskDescription } = req.body;

            if (!taskDescription) {
                res.status(400).json({
                    success: false,
                    message: "Task description was not provided",
                } as IApiResponse);
                return;
            }

            const subtasks = await AIService.generateSubtasks(taskDescription);

            res.status(200).json({
                success: true,
                data: subtasks,
                message: "Subtasks generated successfully",
            } as IApiResponse);
        } catch (err) {
            next(err);
        }
    }
}
