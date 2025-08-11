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
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Write unit tests for controllers",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Set up MongoDB connection",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Implement authentication",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add user registration endpoint",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add user login endpoint",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Document API endpoints",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Configure ESLint and Prettier",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add Husky pre-commit hooks",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Implement error handling middleware",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add logging to the app",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Deploy app to Heroku",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add CORS support",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Create a README file",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add pagination to GET /posts",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Implement post update endpoint",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add post search functionality",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Refactor routes for scalability",
            completed: true,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Add Swagger API documentation",
            completed: false,
            createdAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            title: "Write integration tests",
            completed: false,
            createdAt: new Date(),
        },
    ];

    return hardCodedPosts;
};
