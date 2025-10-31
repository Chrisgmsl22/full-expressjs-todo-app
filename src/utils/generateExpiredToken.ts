import { IJwtPayload } from "../types";
import jwt from "jsonwebtoken";

export const generateExpiredToken = (
    userId: string,
    email: string,
    username: string
): string => {
    const payload: IJwtPayload = {
        userId,
        email,
        username: username,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET not configured");
    }

    // Create a token that expired 1 hour ago
    return jwt.sign(payload, secret, { expiresIn: "-1h" });
};
