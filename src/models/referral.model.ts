

import mongoose from "mongoose";

export interface ReferralActivity {
    referredUser: mongoose.Types.ObjectId; // User who was referred
    status: "pending" | "active" | "completed"; // Status of the referral
    createdAt: Date; // When the referral was made
    activatedAt?: Date; // When the referral was activated
}

export interface ReferralDocument extends mongoose.Document {
    user: mongoose.Types.ObjectId; // User who owns the referral
    qrCode: string; // Referral code
    activities: ReferralActivity[]; // List of referral activities
    rewardPoints: number; // Total reward points
    createdAt: Date;
    updatedAt: Date;
}

const referralActivitySchema = new mongoose.Schema<ReferralActivity>(
    {
        referredUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "active", "completed"],
            default: "pending",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        activatedAt: {
            type: Date,
        },
    },
    { _id: false } // Disable automatic ID for embedded documents
);

const referralSchema = new mongoose.Schema<ReferralDocument>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        qrCode: {
            type: String,
            required: true,
            unique: true,
        },
        activities: [referralActivitySchema],
        rewardPoints: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Referral = mongoose.model<ReferralDocument>("Referral", referralSchema);
export default Referral;
