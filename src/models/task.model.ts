import mongoose, { Schema } from "mongoose";
import { ITask } from "../types";

// We will use mongoose Schemas for a proper connection with MongoDB
const taskSchema: Schema<ITask> = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    userId: { type: String },
});

// Export this model
export const Task = mongoose.model<ITask>("Task", taskSchema);
