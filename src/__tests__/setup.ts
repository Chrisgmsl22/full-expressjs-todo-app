import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Check if Redis is available (for integration tests)
export const checkRedisConnection = async (): Promise<boolean> => {
    try {
        const { redisClient } = await import("../config/redis.config");

        // Skip check for mock Redis (unit tests)
        if ("__clearMockStore" in redisClient) {
            return true;
        }

        // For real Redis, ping to check connection
        await redisClient.ping();
        return true;
    } catch {
        return false;
    }
};

// Connect this memory server before all tests run
export const connectTestDB = async () => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log("Database connected!");

    // For integration tests, verify Redis is available
    const isIntegrationTest =
        process.env.TEST_TYPE === "integration" ||
        process.argv.some((arg) => arg.includes("integration"));

    if (isIntegrationTest) {
        const redisAvailable = await checkRedisConnection();
        if (!redisAvailable) {
            throw new Error(
                "❌ Redis is not available! Integration tests require Redis.\n" +
                    "   Run: docker-compose up -d redis\n" +
                    "   Or:  make dev"
            );
        }
        console.log("Redis connection verified!");
    }
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
    // Close Redis connection (both mock and real)
    try {
        const { redisClient } = await import("../config/redis.config");

        // Real Redis needs to be disconnected
        if (!("__clearMockStore" in redisClient)) {
            await redisClient.quit();
            console.log("Redis disconnected!");
        }
    } catch (error) {
        // Ignore if Redis was never connected
        console.warn("Could not disconnect Redis:", error);
    }

    // Close MongoDB connections
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};
