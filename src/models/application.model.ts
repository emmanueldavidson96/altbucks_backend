import { Schema, model, Document } from 'mongoose';

export interface IApplication extends Document {
    userId: string;  // Change from ObjectId to string for now
    brand: string;
    taskType: string;
    earnings: number;
    appliedOn: Date;
    deadline: Date;
    status: 'Completed';
    description: string;
}

const ApplicationSchema = new Schema({
    userId: { type: String, required: true },  // Changed from ObjectId to String
    brand: { type: String, required: true },
    taskType: { type: String, required: true },
    earnings: { type: Number, required: true },
    appliedOn: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: {
        type: String,
        default: 'Completed'
    },
    description: { type: String, required: true }
});

export const Application = model<IApplication>('Application', ApplicationSchema);