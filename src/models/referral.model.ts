import mongoose from "mongoose";

export interface ReferralDocument extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    referralLink:string;
    qrCode:string;
    referredBy:string;
    rewardPoints:Number;
    rewardCount:Number;
    createdAt:Date;
    taskActivities: mongoose.Types.ObjectId[]; 
}

const referralSchema = new mongoose.Schema<ReferralDocument>({
    userId: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
        index:true
    },
    referralLink:{
        type:String,
    },
    qrCode:{
      type:String,
    },
    referredBy:{
      type:String,
    },
    rewardPoints:{
      type:Number,
    },
    rewardCount:{
      type:Number,
    },
    createdAt:{
      type:Date,
      required:true,
      default:Date.now,
    },
    taskActivities: [{
      type:mongoose.Schema.Types.ObjectId,
      ref: "TaskActivity" 
    }],    // Reference to TaskActiviy
    
});

const Referral = mongoose.model<ReferralDocument>("Referral", referralSchema);
export default Referral;
