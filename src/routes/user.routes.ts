import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.post("/auth/register", UserController.register);

userRoutes.post("/auth/login", UserController.login);

userRoutes.post("/auth/logout", UserController.logout);
