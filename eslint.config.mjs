import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        // 🎯 Add ignore patterns
        ignores: ["dist/**/*", "node_modules/**/*", "*.js", "*.mjs"],
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
            },
            globals: {
                process: "readonly",
                console: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            // Block console.log for debugging purposes
            "no-console": [
                "error",
                {
                    allow: ["warn", "error", "info"],
                },
            ],
        },
    },
    {
        //  Allow all console methods in specific files where it's intentional
        files: [
            "src/index.ts", // Server startup logs
            "src/config/db.config.ts", // Database connection logs
            "src/config/redis.config.ts", // Redis connection logs
            "src/middleware/errorHandler.ts", // Error middleware
            "src/__tests__/**/*.ts", // All test files
        ],
        rules: {
            "no-console": "off",
        },
    },
    {
        files: ["**/*.test.ts", "**/*.spec.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ["src/**/*.js"],
        languageOptions: {
            globals: {
                process: "readonly",
                console: "readonly",
            },
        },
    },
];
