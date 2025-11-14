/**
 * Mock Redis client for testing
 * This prevents real Redis connections during tests
 */

type RedisValue = string | null;

// In-memory store for testing
const mockStore = new Map<string, { value: string; expiry?: number }>();

export const mockRedisClient = {
    // Track if Redis is "connected" (for tests)
    status: "ready",

    // Mock get operation
    async get(key: string): Promise<RedisValue> {
        const item = mockStore.get(key);
        if (!item) return null;

        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
            mockStore.delete(key);
            return null;
        }

        return item.value;
    },

    // Mock set with expiry (SETEX)
    async setex(key: string, seconds: number, value: string): Promise<"OK"> {
        const expiry = Date.now() + seconds * 1000;
        mockStore.set(key, { value, expiry });
        return "OK";
    },

    // Mock delete operation
    async del(...keys: string[]): Promise<number> {
        let deletedCount = 0;
        keys.forEach((key) => {
            if (mockStore.delete(key)) {
                deletedCount++;
            }
        });
        return deletedCount;
    },

    // Mock keys pattern search
    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp(
            "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
        );
        return Array.from(mockStore.keys()).filter((key) => regex.test(key));
    },

    // Mock exists check
    async exists(key: string): Promise<number> {
        return mockStore.has(key) ? 1 : 0;
    },

    // Mock ping (health check)
    async ping(): Promise<"PONG"> {
        return "PONG";
    },

    // Mock quit (close connection)
    async quit(): Promise<"OK"> {
        mockStore.clear();
        return "OK";
    },

    // Event emitter mocks (no-op)
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),

    // Helper for tests: clear all data
    __clearMockStore() {
        mockStore.clear();
    },
};

export const MockRedisHelper = {
    async get<T>(key: string): Promise<T | null> {
        const data = await mockRedisClient.get(key);
        return data ? JSON.parse(data) : null;
    },

    async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
        await mockRedisClient.setex(key, ttlSeconds, JSON.stringify(value));
    },

    async del(key: string): Promise<void> {
        await mockRedisClient.del(key);
    },

    async delPattern(pattern: string): Promise<void> {
        const keys = await mockRedisClient.keys(pattern);
        if (keys.length > 0) {
            await mockRedisClient.del(...keys);
        }
    },

    async exists(key: string): Promise<boolean> {
        const result = await mockRedisClient.exists(key);
        return result === 1;
    },
};
