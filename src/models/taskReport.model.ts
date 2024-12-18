import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  earnings: number;
  date: Date;
}

const TaskSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    earnings: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
