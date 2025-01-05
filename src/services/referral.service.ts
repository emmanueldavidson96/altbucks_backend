import mongoose from "mongoose";
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
    rewardsBreakdown: { username: string; email: string; pointsEarned: Number }[];
  }> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const referrals = await User.find({ referredBy: user.qrCode });
    const rewardsBreakdown = referrals.map((ref) => ({
      username: ref.username,
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
