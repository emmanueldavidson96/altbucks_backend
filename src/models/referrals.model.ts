import mongoose from "mongoose";

export interface ReferralDocument extends mongoose.Document {
    earnerId: mongoose.Schema.Types.ObjectId;
    email?: string;
    status: "pending" | "accepted";
    sentAt?: Date;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
}

const referralSchema = new mongoose.Schema<ReferralDocument>(
    {
      earnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      email: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
        required: true,
      },
      sentAt: {
        type: Date,
        default: null,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );
  
  const ReferralModel = mongoose.model<ReferralDocument>("Referral", referralSchema);
  export default ReferralModel;