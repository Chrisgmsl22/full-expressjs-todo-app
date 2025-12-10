import { Router } from "express";
import { AIController } from "../controllers/ai.controller";
import { authenticateJWT } from "../middleware";

const aiRoutes = Router();

aiRoutes.post("/subtasks", authenticateJWT, AIController.generateSubtasks);

export default aiRoutes;
