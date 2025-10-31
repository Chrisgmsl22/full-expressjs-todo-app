import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticateJWT } from "../middleware";

// We define a router
const taskRoutes = Router();

// Defining a Get method
taskRoutes.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

taskRoutes.get("/tasks", authenticateJWT, TaskController.getAllTasks);

// Get a post by ID
taskRoutes.get("/tasks/:id", authenticateJWT, TaskController.getTaskById);

// Post a new Post
taskRoutes.post("/tasks", authenticateJWT, TaskController.createTask);

// PATCH a task (partial update)
taskRoutes.patch("/tasks/:id", authenticateJWT, TaskController.updateTask);

// DELETE a task
taskRoutes.delete("/tasks/:id", authenticateJWT, TaskController.deleteTask);

export default taskRoutes;
