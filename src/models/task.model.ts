import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    taskType: string;
    description: string;
    requirements: string;
    location?: string;
    compensation: {
        amount: number;
        currency: string;
    };
    deadline: Date;
    maxRespondents: number;
    attachments?: {
        files: [{
            url: string;
            type: string;
            size: number;
        }];
        links: string[];
    };
    status: 'Open' | 'In Progress' | 'Completed';
    postedDate: Date;
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    taskType: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: String,
    compensation: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' }
    },
    deadline: { type: Date, required: true },
    maxRespondents: { type: Number, required: true },
    attachments: {
        files: [{
            url: String,
            type: String,
            size: Number
        }],
        links: [String]
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed'],
        default: 'Open'
    },
    postedDate: { type: Date, default: Date.now }
});

export const Task = model<ITask>('Task', TaskSchema);