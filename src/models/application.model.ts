import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
    taskId: Types.ObjectId;
    userId: Types.ObjectId;
    appliedOn: Date;
    deadline: Date;
    earnings: number;
    status: 'Pending' | 'Completed' | 'in progress';
    brandName?: string;
}

const ApplicationSchema = new Schema<IApplication>({
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appliedOn: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    earnings: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'in progress'], default: 'Pending' },
    brandName: { type: String }
});

export const Application = model<IApplication>('Application', ApplicationSchema);