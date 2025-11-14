import Redis from "ioredis";
import { JsonValue } from "../types";

// Redis configuration with support for both URL and individual variables
const createRedisClient = () => {
    const commonConfig = {
        retryStrategy: (times: number) => {
            // Limit connection retries to 5 attempts (fail fast)
            const MAX_RETRIES = 5;
            if (times > MAX_RETRIES) {
                console.error(
                    `❌ Redis connection failed after ${MAX_RETRIES} attempts`
                );
                return null; // Stop retrying
            }
            // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
            const delay = Math.min(times * 100, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10000, // 10 seconds
        lazyConnect: false, // Connect immediately on creation
    };

    // Option 1: Use REDIS_URL (production, e.g., Render, Heroku)
    if (process.env.REDIS_URL) {
        console.log("Using REDIS_URL for connection");
        return new Redis(process.env.REDIS_URL, commonConfig);
    }

    // Option 2: Use individual variables (local development)
    return new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
        ...commonConfig,
    });
};

// Create the client
export const redisClient = createRedisClient();

// Connection event handlers (event listeners?)
redisClient.on("connect", () => {
    console.info("Redis connected!");
});

redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
});

redisClient.on("close", () => {
    console.info("Redis connection closed");
});

// Helper functions
export const RedisHelper = {
    // Get cached data
    async get<T>(key: string): Promise<T | null> {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    },

    // Set cached data with TTL (Time To Live)
    async set(key: string, value: JsonValue, ttlSeconds = 300): Promise<void> {
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    },

    // Delete cached data
    async del(key: string): Promise<void> {
        await redisClient.del(key);
    },

    // Delete multiple keys by pattern
    async delPattern(pattern: string): Promise<void> {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    },

    // Check if key exists
    async exists(key: string): Promise<boolean> {
        const result = await redisClient.exists(key);
        return result === 1;
    },
};
