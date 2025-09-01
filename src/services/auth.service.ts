// Business logic, hashing, validation, etc

import { IRegisterRequest, IUser } from "../types";
import bcrypt from "bcrypt";

/**
 *
 *  1. Hash passwords
 *  2. Compare passwords
 *  3. Validate email format
 *  4. Check if user exists
 *  5. Create a new user
 */

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds: number = 12;
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
    givenPassword: string,
    hash: string
): Promise<boolean> => {
    return await bcrypt.compare(givenPassword, hash);
};

export const validateEmail = async (email: string): Promise<boolean> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const createUser = async (
    userData: IRegisterRequest
): Promise<IUser> => {
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object (in real app, this would save to database)
    const newUser: IUser = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date(),
        isActive: true,
        emailVerified: false,
    };

    return newUser;
};

export const findUserByEmail = async (
    _email: string
): Promise<IUser | null> => {
    return null;
};
