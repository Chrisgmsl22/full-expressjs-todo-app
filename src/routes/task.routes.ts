import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

// We define a router
const taskRoutes = Router();

// Defining a Get method
taskRoutes.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

taskRoutes.get("/posts", TaskController.getAllTasks);

// Get a post by ID
taskRoutes.get("/posts/:id", TaskController.getTaskById);

// Post a new Post
taskRoutes.post("/posts", TaskController.createTask);

// DELETE a post
taskRoutes.delete("/posts/:id", TaskController.deleteTask);

taskRoutes.put("/posts/:id", TaskController.updateTask);

export default taskRoutes;
