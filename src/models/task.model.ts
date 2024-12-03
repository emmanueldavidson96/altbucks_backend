import mongoose, { Schema, Document } from 'mongoose';

// Define the Task interface
export interface ITask extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled' | 'under review' | 'approved';
  type: string;
  platform: string;
  amount: number;  // Reward for task
  performedAt?: Date;  // Date task was performed
}

// Define the Task schema
const TaskSchema: Schema<ITask> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'approved', 'under review'],
      default: 'pending',
    },
    type: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Ensure amount is non-negative
    },
    performedAt: {
      type: Date,
      default: null,  // Set when task is completed
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Create the Task model
const TaskModel = mongoose.model<ITask>('Task', TaskSchema);
export default TaskModel;