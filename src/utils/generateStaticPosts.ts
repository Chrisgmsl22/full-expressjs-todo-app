import mongoose from "mongoose";
import { ITask } from "../types";

export const generateStaticPosts = (): ITask[] => {
    const userId = new mongoose.Types.ObjectId().toString();
    const baseDate = new Date();

    const hardCodedPosts: ITask[] = [
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Learn Express with TypeScript",
            description:
                "Master the fundamentals of Express.js framework with TypeScript integration for type-safe backend development.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Build the to-do API",
            description:
                "Create RESTful API endpoints for task management with full CRUD operations.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Write unit tests for controllers",
            description:
                "Implement comprehensive unit tests to ensure controller logic works correctly.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Set up MongoDB connection",
            description:
                "Configure and establish secure connection to MongoDB database with proper error handling.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Implement authentication",
            description:
                "Add JWT-based authentication system with secure password hashing and token management.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add user registration endpoint",
            description:
                "Create endpoint for new user registration with input validation and duplicate checking.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add user login endpoint",
            description:
                "Implement secure login endpoint with credential verification and JWT token generation.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Document API endpoints",
            description:
                "Write clear documentation for all API endpoints including request/response examples.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Configure ESLint and Prettier",
            description:
                "Set up code quality tools to enforce consistent coding standards across the project.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add Husky pre-commit hooks",
            description:
                "Configure Git hooks to automatically run linting and tests before commits.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Implement error handling middleware",
            description:
                "Create centralized error handling middleware for consistent error responses.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add logging to the app",
            description:
                "Integrate logging system to track application behavior and debug issues.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Deploy app to Heroku",
            description:
                "Configure deployment pipeline and deploy application to Heroku cloud platform.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add CORS support",
            description:
                "Enable Cross-Origin Resource Sharing to allow frontend applications to access the API.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Create a README file",
            description:
                "Write comprehensive README with setup instructions, API documentation, and usage examples.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add pagination to GET /tasks",
            description:
                "Implement pagination support for task listing endpoint to handle large datasets efficiently.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Implement post update endpoint",
            description:
                "Create PUT/PATCH endpoint to allow users to modify existing tasks.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add post search functionality",
            description:
                "Enable task search by title, description, or status with query parameters.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Refactor routes for scalability",
            description:
                "Reorganize route structure to support future growth and maintainability.",
            completed: true,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Add Swagger API documentation",
            description:
                "Integrate Swagger/OpenAPI for interactive API documentation and testing.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
        {
            _id: new mongoose.Types.ObjectId().toString(),
            id: new mongoose.Types.ObjectId().toString(),
            title: "Write integration tests",
            description:
                "Create end-to-end integration tests to verify complete workflows and API interactions.",
            completed: false,
            createdAt: baseDate,
            updatedAt: baseDate,
            userId,
        },
    ];

    return hardCodedPosts;
};
