import { AIService } from "./ai.service";
import { ValidationError } from "../utils";

// Create the mock function OUTSIDE the factory so we can reference it in tests
const mockCreate = jest.fn();

// Mock OpenAI module
jest.mock("openai", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: mockCreate,
                },
            },
        })),
    };
});

describe("AIService", () => {
    beforeEach(() => {
        // Clear mock calls between tests
        jest.clearAllMocks();
    });

    describe("generateSubtasks", () => {
        it("should return array of subtasks from valid task description", async () => {
            const mockSubtasks = ["Task 1", "Task 2", "Task 3"];

            // Configure the mock to return a valid OpenAI response
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({ subtasks: mockSubtasks }),
                        },
                    },
                ],
            });

            const result = await AIService.generateSubtasks("Plan a wedding");

            expect(result).toEqual(mockSubtasks);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: "gpt-4o-mini",
                    messages: expect.arrayContaining([
                        expect.objectContaining({ role: "system" }),
                        expect.objectContaining({ role: "user" }),
                    ]),
                    temperature: 0.7,
                    response_format: { type: "json_object" },
                })
            );
        });

        it("should return empty array when response has no subtasks", async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({}),
                        },
                    },
                ],
            });

            const result = await AIService.generateSubtasks("Some task");

            expect(result).toEqual([]);
        });

        it("should return empty array when content is null", async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: null,
                        },
                    },
                ],
            });

            const result = await AIService.generateSubtasks("Some task");

            expect(result).toEqual([]);
        });

        it("should throw ValidationError for empty task description", async () => {
            await expect(AIService.generateSubtasks("")).rejects.toThrow(
                ValidationError
            );
            await expect(AIService.generateSubtasks("")).rejects.toThrow(
                "Task description is required"
            );

            // Verify OpenAI was never called
            expect(mockCreate).not.toHaveBeenCalled();
        });

        it("should propagate OpenAI API errors", async () => {
            mockCreate.mockRejectedValue(new Error("API rate limit exceeded"));

            await expect(
                AIService.generateSubtasks("Valid task")
            ).rejects.toThrow("API rate limit exceeded");
        });

        it("should handle malformed JSON response gracefully", async () => {
            mockCreate.mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: "not valid json",
                        },
                    },
                ],
            });

            await expect(
                AIService.generateSubtasks("Some task")
            ).rejects.toThrow(); // JSON.parse will throw
        });
    });
});
