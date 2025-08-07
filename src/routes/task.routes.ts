import { Router } from "express";
import { PostController } from "../controllers/task.controller";

// We define a router
const taskRoutes = Router();

taskRoutes.get("/posts", PostController.getAllPosts);

// Get a post by ID
taskRoutes.get("/posts/:id", PostController.getPostById);

// Post a new Post
taskRoutes.post("/posts", PostController.createPost);

// DELETE a post
taskRoutes.delete("/posts/:id", PostController.deletePost);

export default taskRoutes;
