import mongoose, { Document, Schema } from 'mongoose';

export interface TransactionLog extends Document {
    amount: number;
    transactionType: string;
    description: string;
    wallet: mongoose.Types.ObjectId;
    transactionDate: Date;
}


const transactionLogSchema: Schema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        transactionType: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
        },
        transactionDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const TransactionLogModel = mongoose.model<TransactionLog>('TransactionLog', transactionLogSchema);

export default TransactionLogModel;
