export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
}


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