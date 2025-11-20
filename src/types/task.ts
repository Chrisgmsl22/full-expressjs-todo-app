// Task domain types
export interface ITask {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt?: Date;
    userId?: string;
}

export interface ICreateTaskRequest {
    title: string;
    description?: string;
}

export interface IUpdateTaskRequest {
    title?: string;
    description?: string;
    completed?: boolean;
}

export interface ITasksPaginatedResult {
    tasks: ITask[];
    total: number;
}
