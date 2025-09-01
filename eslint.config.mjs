import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
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
