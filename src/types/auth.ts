// Authentication related types
export interface IUser {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    emailVerified: boolean;
}

// For input data (creation), we do not need ID
export type IUserInput = Omit<IUser, "id">;
export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface IAuthResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        username: string;
        email: string;
        createdAt: Date;
    };
    token?: string;
}

export interface IAuthError {
    success: false; // Discriminated union (literal type)
    message: string;
    error: string;
}

export interface IUserExistsCheck {
    exists: boolean;
    conflictField?: "email" | "username";
    message?: string;
}
