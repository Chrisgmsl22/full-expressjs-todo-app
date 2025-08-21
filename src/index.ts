import express from "express";
import taskRoutes from "./routes/task.routes";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import mongoose, { ConnectOptions } from "mongoose";
import { Task } from "./models/task.model";

dotenv.config({ path: ".env" });
const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/todo-app-db";

const mongoOptions: ConnectOptions = {
    // These options help with connection stability and debugging
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Timeout for socket operations
    //bufferMaxEntries: 0, // Disable mongoose buffering
};

// Connecting to the DB
const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, mongoOptions);
        console.log("✅ MongoDB connected successfully!");
        console.log(`📍 Database: ${mongoUri}`);
    } catch (err) {
        console.error("❌ MongoDB connection failed:");
        console.error("Error details:", err);
        process.exit(1); // Exit if we can't connect to database
    }
};

// Connection event listeners for debugging
mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("⚠️  MongoDB disconnected");
});

connectDB();
app.use(express.json()); // express.json is a middleware

// Mount the routes under /api
app.use("/api", taskRoutes);

app.use(errorHandler);

// Defining a Get method
app.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Test database operations after connection
const testDatabaseConnection = async () => {
    try {
        // Wait for connection to be ready
        if (mongoose.connection.readyState === 1) {
            const posts = await Task.find();
            console.log(
                "📊 Database test successful! Found posts:",
                posts.length
            );
        } else {
            console.log("⏳ Waiting for database connection...");
        }
    } catch (error) {
        console.error("❌ Database test failed:", error);
    }
};

// Test after a short delay to ensure connection is established
setTimeout(testDatabaseConnection, 1000);
