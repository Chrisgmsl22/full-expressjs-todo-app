export type MongoUserResult = {
    _id: string,
    email: string,
    username: string,
    password: string,
    isActive: boolean,
    emailVerified:boolean
    createdAt: Date
}