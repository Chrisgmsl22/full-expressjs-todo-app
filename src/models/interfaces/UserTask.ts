export interface IUserTask {
    username: string;
    email: string;
    password: string; // ?
    createdAt: Date;
    lastLoginAt?: Date;
    isActive: boolean;
    emailVerified: boolean;
}
