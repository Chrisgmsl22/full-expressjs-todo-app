import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const checkDatabaseConnection = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: "Database connection not available",
        });
        return;
    }
    next(); // Continue to the next middleware/controller
};
