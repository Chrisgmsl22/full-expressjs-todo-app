/**
 * Jest Setup File
 * Runs before ALL tests
 *
 * Strategy:
 * - Unit tests: Mock Redis (fast, no dependencies)
 * - Integration tests: Real Redis from Docker (realistic, slower)
 * - CI/CD: USE_REAL_REDIS=true forces real Redis (service container available)
 */

// Detect test type from file path or environment variable
const testFilePath = process.argv.join(" ");
const useRealRedis =
    process.env.USE_REAL_REDIS === "true" || // CI/CD: explicit flag
    process.env.TEST_TYPE === "integration" || // npm run test:integration
    testFilePath.includes("integration"); // Running integration test files

if (!useRealRedis) {
    // UNIT TESTS: Mock Redis
    jest.mock("../config/redis.config", () => {
        const { mockRedisClient, MockRedisHelper } = jest.requireActual(
            "../__tests__/mocks/redis.mock"
        );

        return {
            redisClient: mockRedisClient,
            RedisHelper: MockRedisHelper,
        };
    });
} else {
    // INTEGRATION TESTS: Real Redis
    if (!process.env.CI) {
        console.log(
            "   ⚠️  Make sure Redis is running: docker-compose up redis -d"
        );
    }
}

// Set timeout based on test type
jest.setTimeout(useRealRedis ? 30000 : 10000);
