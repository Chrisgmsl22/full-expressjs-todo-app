import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Connect this memory server before all tests run
export const connectTestDB = async () => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log("Database connected!");
};

// Clear database AND Redis cache between tests
export const clearTestDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }

    // Clear Redis cache (works for both mock and real Redis)
    try {
        const { redisClient } = await import("../config/redis.config");

        // If it's the mock, clear the mock store
        if ("__clearMockStore" in redisClient) {
            // Type assertion for mock client with custom method
            (
                redisClient as typeof redisClient & {
                    __clearMockStore: () => void;
                }
            ).__clearMockStore();
        } else {
            // If it's real Redis, flush all keys matching our pattern
            const keys = await redisClient.keys("*");
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        }
    } catch (error) {
        // Silently fail if Redis is not available (unit tests without Redis)
        console.warn("Could not clear Redis cache:", error);
    }
};

// Disconnect after all tests have run
export const disconnectTestDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};
