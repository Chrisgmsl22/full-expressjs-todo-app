import { NextFunction, Request, Response } from "express";

export class UserController {
    // Auth methods
    public static async register(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}
    public static async login(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}
    public static async logout(
        _req: Request,
        _res: Response,
        _next: NextFunction
    ) {}

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
