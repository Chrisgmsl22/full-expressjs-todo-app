import { NextFunction, Request, Response } from "express";
import { IUser } from "../types";
import { AuthService } from "../services/auth.service";
import { AuthenticationError, UserNotFoundError } from "../utils";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

// src/middleware/auth.middleware.ts
export const authenticateJWT = async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("Could not validate token")
    }

    const token = authHeader.substring(7) // Removing "Bearer" prefix
    const {valid, payload} = AuthService.verifyToken(token)
    
    if (valid){
        // If valid, fetch user from DB
        const user = await AuthService.findUserById(payload!.userId) // If its valid, then it will always contain a payload

        if (user) {
            req.user = user
        } else {
            throw new UserNotFoundError("User not found")
        }
    } else {
        throw new AuthenticationError("Could not validate token")
    }

    next()
    
}