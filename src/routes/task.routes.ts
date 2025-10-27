import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticateJWT } from "../middleware";

// We define a router
const taskRoutes = Router();

// Defining a Get method
taskRoutes.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

taskRoutes.get("/posts", authenticateJWT, TaskController.getAllTasks);

// Get a post by ID
taskRoutes.get("/posts/:id", authenticateJWT, TaskController.getTaskById);

// Post a new Post
taskRoutes.post("/posts", authenticateJWT, TaskController.createTask);

// DELETE a post
taskRoutes.delete("/posts/:id", authenticateJWT, TaskController.deleteTask);

taskRoutes.put("/posts/:id", authenticateJWT, TaskController.updateTask);

export default taskRoutes;
