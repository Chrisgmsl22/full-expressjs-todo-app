import Redis from "ioredis";
import { JsonValue } from "../types";

const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

// Create the client
export const redisClient = new Redis(redisConfig);

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
