/**
 * Jest Setup File
 * Runs before ALL tests
 * Mocks Redis ONLY for unit tests (not integration tests)
 */

// Only mock Redis for UNIT tests, not integration tests
// Integration tests should use real Redis (from Docker)
const isIntegrationTest = process.argv.some(
    (arg) =>
        arg.includes("integration") || process.env.TEST_TYPE === "integration"
);

if (!isIntegrationTest) {
    // Unit tests: Mock Redis
    jest.mock("../config/redis.config", () => {
        const { mockRedisClient, MockRedisHelper } = jest.requireActual(
            "../__tests__/mocks/redis.mock"
        );

        return {
            redisClient: mockRedisClient,
            RedisHelper: MockRedisHelper,
        };
    });
    console.log("🔧 Using MOCK Redis (unit tests)");
} else {
    // Integration tests: Use real Redis
    console.log("🔧 Using REAL Redis (integration tests)");
}

// Increase Jest timeout for integration tests
jest.setTimeout(15000); // 15 seconds for integration tests with real Redis
