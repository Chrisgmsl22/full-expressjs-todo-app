import OpenAI from "openai";
import { prompts, ValidationError } from "../utils";

export class AIService {
    private static openai: OpenAI | null = null;

    private static getClient(): OpenAI {
        if (!this.openai) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY ?? "",
            });
        }

        return this.openai;
    }

    // Method to generate subtasks (suggestions from a complex topic)
    public static async generateSubtasks(
        taskDescription: string
    ): Promise<string[]> {
        if (!taskDescription) {
            throw new ValidationError("Task description is required");
        }
        try {
            const openAiClient = this.getClient();
            const completion = await openAiClient.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: prompts.taskBreakdown.system,
                    },
                    {
                        role: "user",
                        content: prompts.taskBreakdown.user(taskDescription),
                    },
                ],
                temperature: 0.7,
                max_completion_tokens: 200,
                response_format: { type: "json_object" }, // Forces pure JSON output
            });

            const content = completion.choices[0].message.content;
            const parsed = JSON.parse(content || '{"subtasks": []}');
            return parsed.subtasks || [];
        } catch (err) {
            console.error("AI Service error: ", err);
            throw err;
        }
    }
}
