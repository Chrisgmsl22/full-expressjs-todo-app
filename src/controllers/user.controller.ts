import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { IAuthResponse } from "../types";

export class UserController {
    // What it should do:
    // 1. Extract { username, email, password } from req.body
    // 2. Call AuthService.createUser()
    // 3. Generate JWT token for new user
    // 4. Return success response with user data + token
    // 5. Handle errors (user exists, validation failed, etc.)
    public static async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {username, email, password} = req.body
            const propsMissing = !username || !email || !password
            const propTypesNotValid = typeof username !== "string" || typeof email !== "string" || typeof password !== "string"
            if (propsMissing || propTypesNotValid){
                res.status(400).json({
                    success: false,
                    error: "username, email and password are required and must be strings"
                })
                return
            }

            // If args are valid, we attempt user creation
            const userCreated = await AuthService.createUser({username: username.toLowerCase(), email: email.toLowerCase(), password})
            const userJwt = AuthService.generateToken(userCreated)

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    id: userCreated.id,
                    username: userCreated.username,
                    email: userCreated.email,
                    createdAt: userCreated.createdAt
                },
                token: userJwt
            } as IAuthResponse)
        } catch (error) {
            next(error)
        }
    }
    // What it should do:
    // 1. Extract { email, password } from req.body
    // 2. Call AuthService.validateLogin()
    // 3. Generate JWT token for authenticated user
    // 4. Return success response with user data + token
    // 5. Handle errors (invalid credentials, user not found, etc.)
    public static async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {email, password} = req.body
            const propsMissing = !email || !password
            const propTypesNotValid = typeof email !== "string" || typeof password !== "string"
            if (propsMissing || propTypesNotValid){
                res.status(400).json({
                    success: false,
                    error: "email and password are required and must be strings"
                })
                return
            }

            const validatedUser = await AuthService.validateLogin(email, password)
            const userJwt = AuthService.generateToken(validatedUser)

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                user: {
                    id: validatedUser.id,
                    username: validatedUser.username,
                    email: validatedUser.email,
                    createdAt: validatedUser.createdAt
                },
                token: userJwt
            } as IAuthResponse)
        
        } catch (error) {
            next(error)
        }
    }

    // What it should do (simpler with JWT):
    // 1. Since JWT is stateless, just return success message
    // 2. Client should delete token from storage
    // 3. (Optional: Could implement token blacklisting later)
    public static async logout(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            
            const logoutRes = AuthService.logout() as IAuthResponse

            res.status(200).json(logoutRes)
        } catch (error) {
            next(error)
        }

    
    }

    // Future-proofing user operations (for now these are defined as empty)
    public static async getProfile(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}
    public static async updateProfile(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}
    public static async changePassword(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}
}
