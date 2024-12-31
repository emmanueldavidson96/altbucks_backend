import { Schema, model, Document, Types } from 'mongoose';

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
    status: 'pending' |'in progress' | 'completed';
    postedDate: Date;
    userId: Types.ObjectId;
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
        enum: ['writing', 'design', 'development', 'review', 'vedio review', 'marketing', 'vedio Editing', 'data analysis']
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
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    }
}, {
    timestamps: true
});

// Add compound indexes for common queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, postedDate: -1 });

export const Task = model<ITask>('Task', TaskSchema);