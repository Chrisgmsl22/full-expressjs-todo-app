import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils";
import { IAuthResponse } from "../types";

//? In order to have an actual next() middleware handler, we need to define this function with EXACTLY 4 params
// error, request, response and next()
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Handle custom application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        } as IAuthResponse);
    } else {
        if (process.env.NODE_ENV !== "production") {
            // Only for debugging purposes
            console.error("❌ Error Handler Caught:");
            console.error("Message:", err.message);
            console.error("Stack:", err.stack);
            console.error("Type:", err.constructor.name);
        }

        // Generic server error for unknown errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
        } as IAuthResponse);
    }
};
