// Business logic, hashing, validation, etc

import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { IJwtPayload, IRegisterRequest, ITokenVerificationResult, IUser } from "../types";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken"

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
    public static async findUserById(userId: string): Promise<IUser | null> {
        return await UserModel.findById(userId)
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

    // Hacky approach for adding compatibility for mongoose's built-in id obj
    public static async generateToken(currentUser: IUser & {_id: mongoose.Types.ObjectId}): Promise<string> {
        const payload: IJwtPayload = {
            userId: currentUser._id.toString(),
            email: currentUser.email,
            userName: currentUser.username
        }

        const secret = process.env.JWT_SECRET
        if (!secret) {
            throw new Error("JWT_SECRET not configured")
        }
        
        const options: SignOptions = {expiresIn: "1h"}

        // Actually generate the token
        const token = jwt.sign(payload, secret, options)
        
        return token
    }

    public static verifyToken(token: string): ITokenVerificationResult {
        const secret = process.env.JWT_SECRET
        if (!secret) {
            return {valid: false, error: "JWT_SECRET not configured"}
        }

        try {
            const decoded = jwt.verify(token, secret) as IJwtPayload
            return {valid: true, payload: decoded}
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return {valid: false, error: "Token has expired"}
            } else if (error instanceof jwt.JsonWebTokenError) {
                return {valid: false, error: "Invalid token"}
            } else {
                console.error(error)
                return {valid: false, error: `Token verification failed: ${error}`}
            }
        }
    }

    public static async validateLogin(email: string, password: string): Promise<IUser & {_id: mongoose.Types.ObjectId}> {
        // 1. Try to find the user
        const user = await this.findUserByEmail(email)
        if (!user) {
            throw new Error("Invalid email or password") // DO NOT reveal which one is wrong for security
        }

        // Check if account is still active
        if(!user.isActive){
            throw new Error("Account has been deactivated")
        }

        // compare passwords to check if login is valid
        const isPasswordValid = await this.comparePassword(password, user.password)

        if (!isPasswordValid) {
            throw new Error ('Invalid email or password')
        }

        // At this point, we can assume the user is valid
        return user as IUser & {_id: mongoose.Types.ObjectId}
    }
}
