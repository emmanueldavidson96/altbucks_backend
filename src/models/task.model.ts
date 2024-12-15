// src/models/task.model.ts

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
        files: Array<{
            url: string;
            type: string;
            size: number;
        }>;
        links: string[];
    };
    status: 'Open' | 'In Progress' | 'Completed';
    postedDate: Date;
}

const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    taskType: {
        type: String,
        required: [true, 'Task type is required'],
        enum: ['writing', 'design', 'development', 'review']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    requirements: {
        type: String,
        required: [true, 'Requirements are required'],
        trim: true
    },
    location: {
        type: String,
        enum: ['remote', 'onsite', ''],
        default: ''
    },
    compensation: {
        amount: {
            type: Number,
            required: [true, 'Compensation amount is required'],
            min: [0, 'Compensation cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP']
        }
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    maxRespondents: {
        type: Number,
        required: true,
        min: [1, 'Must accept at least one respondent']
    },
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
    postedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const Task = model<ITask>('Task', TaskSchema);