import mongoose from "mongoose";
import { IPostTask } from "../models/interfaces";

export const generateStaticPosts = (): IPostTask[] => {
    const hardCodedPosts: IPostTask[] = [
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Learn Express with TypeScript",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Build the to-do API",
            completed: true,
            createdAt: new Date(),
        },
    ];

    return hardCodedPosts;
};
