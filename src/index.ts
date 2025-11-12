import express from "express";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { checkDatabaseConnection } from "./middleware/checkDatabaseConnection";
import userRoutes from "./routes/user.routes";
import { connectDB, redisClient, testDatabaseConnection } from "./config";

// Only load this if we're not in docker
if (!process.env.DOCKER_ENV) {
    dotenv.config({ path: ".env" });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // express.json is a middleware

// Mount the routes under /api
app.use("/api", checkDatabaseConnection, taskRoutes);
app.use("/api", userRoutes);

// MUST BE LAST
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await connectDB();
        await redisClient.ping();
        console.info("Redis is ready");

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        await testDatabaseConnection();
    } catch (error) {
        console.error("Failed to start server: ", error);
        process.exit(1);
    }
};

startServer(); // We don't use await because we are not inside an async function

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
    console.log("\n⏳ Shutting down gracefully...");
    try {
        await redisClient.quit();
        await mongoose.connection.close();
        console.log("✅ Connections closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
