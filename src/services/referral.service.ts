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
