import mongoose, { Schema } from "mongoose";
import { IPostTask } from "./interfaces";

// We will use mongoose Schemas for a proper connection with MongoDB
const postTaskSchema: Schema<IPostTask> = new Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Export this model
export const Task = mongoose.model<IPostTask>("Task", postTaskSchema);
