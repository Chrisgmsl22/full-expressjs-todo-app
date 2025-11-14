import mongoose, { ConnectOptions } from "mongoose";

const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/todo-app-db";

const mongoOptions: ConnectOptions = {
    // These options help with connection stability and debugging
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Timeout for socket operations
};

// Connecting to the DB
export const connectDB = async () => {
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

// Test database operations after connection
export const testDatabaseConnection = async (): Promise<void> => {
    try {
        // Wait for connection to be ready
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            const collections = await mongoose.connection.db
                .listCollections()
                .toArray();
            console.log(`Database ready! Collections: ${collections.length}`);
        } else {
            console.log("Waiting for database connection...");
        }
    } catch (error) {
        console.error("❌ Database test failed:", error);
    }
};
