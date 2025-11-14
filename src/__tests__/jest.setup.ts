/**
 * Jest Setup File
 * Runs before ALL tests
 *
 * Strategy:
 * - Unit tests: Mock Redis (fast, no dependencies)
 * - Integration tests: Real Redis from Docker (realistic, slower)
 */

// Detect test type from file path or environment variable
const testFilePath = process.argv.join(" ");
const isIntegrationTest =
    testFilePath.includes("integration") ||
    process.env.TEST_TYPE === "integration" ||
    process.env.USE_REAL_REDIS === "true";

if (!isIntegrationTest) {
    // ✅ UNIT TESTS: Mock Redis
    jest.mock("../config/redis.config", () => {
        const { mockRedisClient, MockRedisHelper } = jest.requireActual(
            "../__tests__/mocks/redis.mock"
        );

        return {
            redisClient: mockRedisClient,
            RedisHelper: MockRedisHelper,
        };
    });
    console.log("🧪 [UNIT TEST MODE] Using MOCK Redis");
} else {
    // ✅ INTEGRATION TESTS: Real Redis
    console.log("🐳 [INTEGRATION TEST MODE] Using REAL Redis (localhost:6379)");
    console.log(
        "   ⚠️  Make sure Redis is running: docker-compose up redis -d"
    );
}

// Set timeout based on test type
jest.setTimeout(isIntegrationTest ? 30000 : 10000);
