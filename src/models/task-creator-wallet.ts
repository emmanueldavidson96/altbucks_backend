import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskCreatorWallet extends Document {
    availableBalance: number;
    totalBalanceDeposited: number;
    totalTaskDeductions: number;
    user: mongoose.Types.ObjectId;
}

const walletSchema: Schema = new Schema(
    {
        availableBalance: {
            type: Number,
            required: true,
            default: 0.0,
        },
        otalBalanceDeposited: {
            type: Number,
            required: true,
            default: 0.0,
        },
        ttotalTaskDeductions: {
            type: Number,
            required: true,
            default: 0.0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const TaskCreatorWallet = mongoose.model<ITaskCreatorWallet>('Wallet', walletSchema);

export default TaskCreatorWallet;

