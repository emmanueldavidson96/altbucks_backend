import { Schema, model, Document } from 'mongoose';

// Task interface for TypeScript type checking
export interface ITask extends Document {
    title: string;
    description: string;
    category: 'Design' | 'Development' | 'Writing' | 'Review';
    payment: {
        amount: number;
        currency: string;
    };
    deadline: Date;
    postedDate: Date;
    requirements: string[];
    skillsRequired: string[];
    experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
    status: 'Open' | 'In Progress' | 'Completed';
    applicationsCount: number;
}

// Task Schema
const TaskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Design', 'Development', 'Writing', 'Review']
    },
    payment: {
        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0, 'Payment cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    requirements: [{
        type: String,
        trim: true
    }],
    skillsRequired: [{
        type: String,
        trim: true
    }],
    experienceLevel: {
        type: String,
        enum: ['Entry', 'Intermediate', 'Expert'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed'],
        default: 'Open'
    },
    applicationsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient querying
TaskSchema.index({ category: 1 });
TaskSchema.index({ 'payment.amount': 1 });
TaskSchema.index({ postedDate: -1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ applicationsCount: 1 });

// Virtual field for time since posting
TaskSchema.virtual('timePosted').get(function() {
    return new Date().getTime() - this.postedDate.getTime();
});

export const Task = model<ITask>('Task', TaskSchema);