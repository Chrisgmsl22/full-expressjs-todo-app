// import { Document } from "mongoose"; //todo DISABLED FOR NOW

export interface IPostTask {
    _id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}
