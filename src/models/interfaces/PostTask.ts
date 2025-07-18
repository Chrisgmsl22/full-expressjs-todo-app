import { Document } from "mongoose";

export interface IPostTask extends Document {
    title: string;
    completed: boolean;
    createdAt: Date;
}
