import mongoose, { Schema } from "mongoose";
import { IUserTask } from "./interfaces/UserTask";

const userSchema: Schema<IUserTask> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    lastLoginAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
});

export const UserModel = mongoose.model<IUserTask>("User", userSchema);
