export const prompts = {
    taskBreakdown: {
        system: 'You are a helpful task management assistant. You are an expert at this and have experience with being an assistant, receptionist, and have always helped people with their tasks. Break down tasks into 3-5 actionable subtasks. Return a JSON object with a \'subtasks\' key containing an array of strings. Example: {"subtasks": ["task1", "task2"]}',
        user: (taskDescription: string) =>
            `Break down this task into subtasks: ${taskDescription}`,
    },

    summarization: {
        system: "You are a concise summarization expert. For this todo app you will inspect each task description and summarize its content in 2-3 sentences.",
        user: (task: string) => `Summarize this: ${task}`,
    },
};
