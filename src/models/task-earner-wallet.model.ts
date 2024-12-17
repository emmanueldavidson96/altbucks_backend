import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    availableBalance: number;
    totalBalanceEarned: number;
    totalBalanceWithdrawn: number;
    user: mongoose.Types.ObjectId;
}

const walletSchema: Schema = new Schema(
    {
        availableBalance: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalBalanceEarned: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalBalanceWithdrawn: {
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

const TaskEarnerWallet = mongoose.model<Wallet>('Wallet', walletSchema);

export default TaskEarnerWallet;
