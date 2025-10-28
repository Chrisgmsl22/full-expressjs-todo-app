import express from "express";
import taskRoutes from "../routes/task.routes";
import userRoutes from "../routes/user.routes";
import { errorHandler } from "../middleware";

// We will create a test version of this todo app (without starting the server)
export const createTestApp = () => {
    const app = express();

    app.use(express.json());

    app.use("/api", taskRoutes);
    app.use("/api", userRoutes);

    app.use(errorHandler);

    return app;
};
