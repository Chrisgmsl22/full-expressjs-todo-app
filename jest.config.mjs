export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    // Only match files ending in .test.ts or .spec.ts (excludes helper files)
    testMatch: ["**/?(*.)+(spec|test).ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
    coverageDirectory: "coverage",
    verbose: true,
    // Setup file to run before tests (mocks Redis, sets timeouts)
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/jest.setup.ts"],
    // Increase timeout for integration tests
    testTimeout: 10000,
};

/**
 * 
 * AAA Pattern: 
 *  - Arrange: Set up test data
 *  - Act: Execute function being tested
 *  - Assert: Verify the result
 * 
 *  Common Jest Matchers
 *  expect(value).toBe(5)              // Exact equality
    expect(value).toEqual({a: 1})      // Deep equality (for objects)
    expect(value).toBeDefined()        // Not undefined
    expect(value).toBeTruthy()         // Truthy value
    expect(value).toContain('text')    // Array/string contains
    expect(fn).toThrow()               // Function throws error
 */
