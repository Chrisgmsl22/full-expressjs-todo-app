// Business logic, hashing, validation, etc

import { UserModel } from "../models/user.model";
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
export class AuthService {
    private static async hashPassword(password: string): Promise<string> {
        const saltRounds: number = 12;

        return await bcrypt.hash(password, saltRounds);
    }
    private static async comparePassword(
        givenPassword: string,
        hash: string
    ): Promise<boolean> {
        return await bcrypt.compare(givenPassword, hash);
    }
    private static async validateEmail(email: string): Promise<boolean> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    private static validatePasswordStrength(password: string): boolean {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers
        );
    }

    public static async findUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email: email.toLowerCase() });
    }

    public static async createUser(userData: IRegisterRequest): Promise<IUser> {
        // First, check if the user already exists
        const existingUser = await AuthService.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Validate that the given email is valid
        const isValidEmail = await AuthService.validateEmail(userData.email);
        if (!isValidEmail) {
            throw new Error("Invalid email format");
        }

        const isValidPassword = AuthService.validatePasswordStrength(
            userData.password
        );

        if (!isValidPassword) {
            throw new Error(
                "Password is not valid, must be at least 8 digits long, must contain alpha numeric characters"
            );
        }

        // Hash the password
        const hashedPassword = await AuthService.hashPassword(
            userData.password
        );

        // Create user object (in real app, this would save to database)
        const newUser = new UserModel<IUser>({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date(),
            isActive: true,
            emailVerified: false,
        });

        return await newUser.save();
    }
}
