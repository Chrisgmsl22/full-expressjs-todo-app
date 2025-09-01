// Business logic, hashing, validation, etc

import { IUser } from "../types";

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

export const createUser = async (_userData: string): Promise<IUser | null> => {
    return null;
};

export const findUserByEmail = async (
    _email: string
): Promise<IUser | null> => {
    return null;
};
