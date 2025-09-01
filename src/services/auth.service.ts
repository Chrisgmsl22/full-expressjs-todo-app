// Business logic, hashing, validation, etc

import { IUserTask } from "../models/interfaces/UserTask";

/**
 *
 *  1. Hash passwords
 *  2. Compare passwords
 *  3. Validate email format
 *  4. Check if user exists
 *  5. Create a new user
 */

export const hashPassword = async (_password: string): Promise<string> => {
    return "";
};

export const comparePassword = async (
    _password: string,
    _hash: string
): Promise<boolean> => {
    return false;
};

export const validateEmail = async (_email: string): Promise<boolean> => {
    return false;
};

//todo: Add RegisterData interface
export const createUser = async (
    _userData: string
): Promise<IUserTask | null> => {
    return null;
};

export const findUserByEmail = async (
    _email: string
): Promise<IUserTask | null> => {
    return null;
};
