import { Router } from "express";
import { PostController } from "../controllers/task.controller";

// We define a router
const taskRoutes = Router();

// Defining a Get method
taskRoutes.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

taskRoutes.get("/posts", PostController.getAllPosts);

// Get a post by ID
taskRoutes.get("/posts/:id", PostController.getPostById);

// Post a new Post
taskRoutes.post("/posts", PostController.createPost);

// DELETE a post
taskRoutes.delete("/posts/:id", PostController.deletePost);

taskRoutes.put("/posts/:id", PostController.updatePost);

export default taskRoutes;
