export interface IJwtPayload {
    userId: string
    email: string
    userName: string
}


export interface ITokenVerificationResult {
    valid: boolean
    payload?: IJwtPayload
    error?: string
}