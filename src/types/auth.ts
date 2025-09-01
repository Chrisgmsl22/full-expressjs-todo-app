// Authentication related types
export interface IUser {
    id?: string;
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
    user: Omit<IUser, "password">;
    token: string;
}
