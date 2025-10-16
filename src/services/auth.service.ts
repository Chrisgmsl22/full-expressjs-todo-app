// Business logic, hashing, validation, etc

import { UserModel } from "../models/user.model";
import { IJwtPayload, IRegisterRequest, ITokenVerificationResult, IUser, IUserExistsCheck, IUserInput } from "../types";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken"
import { AccountDeactivationError, AuthenticationError, ConflictError, ValidationError } from "../utils";

/**
 *
 *  1. Hash passwords
 *  2. Compare passwords
 *  3. Validate email format
 *  4. Check if user exists
 *  5. Create a new user
 */
export class AuthService {
    public static async hashPassword(password: string): Promise<string> {
        const saltRounds: number = 12;

        return await bcrypt.hash(password, saltRounds);
    }
    public static async comparePassword(
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
        return await UserModel.findOne({ email });
    }
    public static async findUserById(userId: string): Promise<IUser | null> {
        return await UserModel.findById(userId)
    }

    public static async checkUserConflicts(email: string, username: string): Promise<IUserExistsCheck> {
        // Single DB query using $or operator for efficiency
        const existingUser = await UserModel.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        })

        if (!existingUser) {
            return {exists: false}
        }

        // Determine which field conflicts
    if (existingUser.email === email.toLowerCase()) {
        return {
            exists: true,
            conflictField: 'email',
            message: 'User with this email already exists'
        };
    } else {
        return {
            exists: true,
            conflictField: 'username', 
            message: 'Username already exists'
        };
    }
    }

    
    public static async createUser(userData: IRegisterRequest): Promise<IUser> {
        const conflict = await AuthService.checkUserConflicts(userData.email, userData.username)

        if (conflict.exists) {
            throw new ConflictError(conflict.message!) // If we ever get to this point, we know for sure there will be a message
        }

        // Validate that the given email is valid
        const isValidEmail = await AuthService.validateEmail(userData.email);
        if (!isValidEmail) {
            throw new ValidationError("Invalid email format");
        }

        const isValidPassword = AuthService.validatePasswordStrength(
            userData.password
        );

        if (!isValidPassword) {
            throw new AuthenticationError(
                "Password is not valid, must be at least 8 digits long, must contain alpha numeric characters"
            );
        }

        // Hash the password
        const hashedPassword = await AuthService.hashPassword(
            userData.password
        );

        // Create user object with strict typing
        const userCreateData: IUserInput = {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date(),
            isActive: true,
            emailVerified: false,
        };
        
        const newUser = new UserModel(userCreateData);

        return await newUser.save()
    }

    // Hacky approach for adding compatibility for mongoose's built-in id object
    
    public static generateToken(currentUser: IUser): string {
        const payload: IJwtPayload = {
            userId: currentUser.id, // Mongoose virtual getter, we can assume it always works
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

    public static async validateLogin(email: string, password: string): Promise<IUser> {
        // 1. Try to find the user
        const user = await this.findUserByEmail(email)
        if (!user) {
            throw new AuthenticationError("Invalid email or password") // DO NOT reveal which one is wrong for security
        }

        // Check if account is still active
        if(!user.isActive){
            throw new AccountDeactivationError("Account has been deactivated")
        }

        // compare passwords to check if login is valid
        const isPasswordValid = await this.comparePassword(password, user.password)

        if (!isPasswordValid) {
            throw new AuthenticationError ('Invalid email or password')
        }

        // At this point, we can assume the user is valid
        return user as IUser
    }

    public static logout(): {success: boolean; message: string} {
        // JWT is stateless, so we just return success
        // Client should delete token from localStorage/cookies
        return {
            success: true, 
            message: "Logged out successfully!. Please remove token from client"
        }
    }
}
