// Authentication related types
export interface IUser {
    // id: string,
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    emailVerified: boolean;
}

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
