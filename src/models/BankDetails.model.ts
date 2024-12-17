import mongoose, { Document, Schema } from 'mongoose';

export interface BankDetails extends Document {
    beneficiary: string;
    bankName: string;
    bankShortCode: string;
    accountNumber: string;
    country: string;
    user: mongoose.Types.ObjectId;
}

const bankDetailsSchema: Schema = new Schema(
    {
        beneficiary: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        bankShortCode: {
            type: String,
            required: true,
            trim: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
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

const BankDetailsModel = mongoose.model<BankDetails>('BankDetails', bankDetailsSchema);

export default BankDetailsModel;
