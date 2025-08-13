import { Request, Response } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response) => {
    console.error("Error: ", err.stack);

    res.status(500).json({
        message: "An unexpected error ocurred.",
        error: err.message,
    });
};
