import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticateJWT } from "../middleware";
import {
    cacheMiddleware,
    invalidateCache,
} from "../middleware/cache.middleware";

// We define a router
const taskRoutes = Router();

// Defining a Get method
taskRoutes.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

taskRoutes.get(
    "/tasks",
    authenticateJWT,
    cacheMiddleware("tasks:list", 300),
    TaskController.getAllTasks
);

// Get a post by ID
taskRoutes.get(
    "/tasks/:id",
    authenticateJWT,
    cacheMiddleware("tasks:detail", 300),
    TaskController.getTaskById
);

// Post a new Post
taskRoutes.post(
    "/tasks",
    authenticateJWT,
    invalidateCache("tasks:list"), // Invalidate cache on every post, to always get fresh data
    TaskController.createTask
);

// PATCH a task (partial update)
taskRoutes.patch(
    "/tasks/:id",
    authenticateJWT,
    invalidateCache("tasks:list"),
    invalidateCache("tasks:detail"),
    TaskController.updateTask
);

// DELETE a task
taskRoutes.delete(
    "/tasks/:id",
    authenticateJWT,
    invalidateCache("tasks:list"),
    invalidateCache("tasks:detail"),
    TaskController.deleteTask
);

export default taskRoutes;
