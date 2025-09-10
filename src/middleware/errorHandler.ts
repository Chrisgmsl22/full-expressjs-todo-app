import { NextFunction, Request, Response } from "express";
import { AuthenticationError, ConflictError, ValidationError } from "../utils";
import { IAuthResponse } from "../types";

//? In order to have an actual next() middleware handler, we need to define this function with EXACTLY 4 params
// error, request, response and next()
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error: ", err.stack);

    
    // Handle custom error types
    if (err instanceof ValidationError) {
        res.status(400).json({
            success: false,
            message: err.message
        } as IAuthResponse);
    } else if (err instanceof ConflictError) {
        res.status(409).json({
            success: false,
            message: err.message
        } as IAuthResponse);
    } else if (err instanceof AuthenticationError) {
        res.status(401).json({
            success: false,
            message: err.message
        } as IAuthResponse);
    } else {
        // Generic server error
        res.status(500).json({
            success: false,
            message: "Internal server error"
        } as IAuthResponse);
    }
};
