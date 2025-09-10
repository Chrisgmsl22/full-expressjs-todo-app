/**
 * This class will have all possible errors so that its an easier error handling experience
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ValidationError"
    }
}

export class ConflictError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ConflictError"
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthenticationError"
    }
}