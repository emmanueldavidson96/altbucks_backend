// src/models/application.model.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
    userId: string;  // Changed to string for testing
    taskId: Types.ObjectId;
    brandName: string;
    appliedDate: Date;
    deadline: Date;
    earnings: number;
    status: 'Pending' | 'In Progress' | 'Completed';
    description?: string;
}

const ApplicationSchema = new Schema({
    userId: {
        type: String,  // Changed to String for testing
        required: [true, 'User ID is required']
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Task ID is required']
    },
    brandName: {
        type: String,
        required: [true, 'Brand name is required']
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    earnings: {
        type: Number,
        required: [true, 'Earnings amount is required'],
        min: [0, 'Earnings cannot be negative']
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

export const Application = model<IApplication>('Application', ApplicationSchema);