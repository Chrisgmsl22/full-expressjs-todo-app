export interface IJwtPayload {
    userId: string;
    email: string;
    username: string;
}

export interface ITokenVerificationResult {
    valid: boolean;
    payload?: IJwtPayload;
    error?: string;
}
