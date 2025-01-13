/*import mongoose from "mongoose";
import Referral from "../models/referral.model";
import User, { UserDocument } from "../models/user.model";
import { generateQRCode } from "../utils/qrcode";

class ReferralService {
  // Find a user by ID
  async findUserById(userId: string): Promise<UserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }
    return User.findById(userId);
  }

  // Generate a new referral code
  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.qrCode) {
      return user.qrCode; // Return existing QR code if present
    }

    const qrCode = generateQRCode(userId);
    user.qrCode = qrCode;
    await user.save();

    return qrCode;
  }

  // Create a new referral
  async createReferral(data: {
    referredBy: string;
    userId: string;
    referralLink: string;
    qrCode: string;
  }): Promise<void> {
    const { referredBy, userId, referralLink, qrCode } = data;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(referredBy)
    ) {
      throw new Error("Invalid ID format");
    }

    const user = await this.findUserById(userId);
    const referrer = await User.findById(referredBy);
    if (!user || !referrer) {
      throw new Error("User or Referrer not found");
    }

    // Create referral entry
    const referral = new Referral({ referredBy, userId, referralLink, qrCode });
    await referral.save();

    // Increment referrer's reward points and referral count
    await User.updateOne({ qrCode: referredBy }, { $inc: { rewardPoints: 10, referralCount: 1 } });
  }

  // Fetch referrals with filters and sorting
  async fetchReferrals(filters: any, sort: any): Promise<any[]> {
    return Referral.find(filters).sort(sort);
  }

  // Track referrals for a user
  async trackReferrals(userId: string): Promise<UserDocument[]> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return User.find({ referredBy: user.qrCode });
  }

  // Get leaderboard
  async getLeaderboard(): Promise<UserDocument[]> {
    return User.find({}, "-password").sort({ referralCount: -1 }).limit(10);
  }

  // Get rewards for a user
  async getRewards(userId: string): Promise<{
    totalRewardPoints: Number;
    rewardsBreakdown: { email: string; pointsEarned: Number }[];
  }> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const referrals = await User.find({ referredBy: user.qrCode });
    const rewardsBreakdown = referrals.map((ref) => ({
      email: ref.email,
      pointsEarned: 10, // Assuming 10 points per referral
    }));

    return {
      totalRewardPoints: user.rewardPoints,
      rewardsBreakdown,
    };
  }
}

export default new ReferralService();
*/
import mongoose from "mongoose";
import Referral from "../models/referral.model";
import { NOT_FOUND, CONFLICT, CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

interface ReferralData {
  userId: string;
  referredUserId?: string;
  status?: string;
}

export const generateReferralCode = async (userId: string) => {
  // Check if the user already has a referral code
  const existingReferral = await Referral.findOne({ user: userId });
  appAssert(!existingReferral, CONFLICT, "Referral code already exists");

  // Generate a new referral code
  const referralCode = `REF-${userId.slice(-6)}-${Date.now()}`;
  const newReferral = await Referral.create({
    user: userId,
    code: referralCode,
    activities: [],
  });

  return {
    message: "Referral code generated successfully",
    referralCode: newReferral.qrCode,
  };
};

export const trackReferrals = async (referralCode: string, referredUserId: string) => {
  const referral = await Referral.findOne({ code: referralCode });
  appAssert(referral, NOT_FOUND, "Invalid referral code");

  // Ensure the referred user is not already added
  const existingActivity = referral.activities.find(
    (activity) => activity.referredUser.toString() === referredUserId
  );
  appAssert(!existingActivity, CONFLICT, "User already referred");

  referral.activities.push({
    referredUser: new mongoose.Types.ObjectId(referredUserId),
    status: "pending",
    createdAt: new Date(),
  });

  await referral.save();

  return { message: "Referral tracked successfully", referral };
};

export const getReferralDetails = async (referralCode: string) => {
  const referral = await Referral.findOne({ code: referralCode }).populate("activities.referredUser");
  appAssert(referral, NOT_FOUND, "Referral code not found");

  return referral;
};

export const updateReferralActivity = async (data: ReferralData) => {
  const { userId, referredUserId, status } = data;

  const referral = await Referral.findOne({ user: userId });
  appAssert(referral, NOT_FOUND, "Referral not found");

  const activity = referral.activities.find(
    (activity) => activity.referredUser.toString() === referredUserId
  );
  appAssert(activity, NOT_FOUND, "Referral activity not found");

  // Update activity status
  activity.status = status as "pending" | "active" | "completed";
  if (status === "active") {
    activity.activatedAt = new Date();
  }

  await referral.save();

  return { message: "Referral activity updated successfully", activity };
};
