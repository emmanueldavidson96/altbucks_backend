import { Request, Response } from "express";
import referralService from "../services/referral.service";

// Utility to handle errors
const handleError = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  } else {
    console.error("Unknown error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// Share Referral
export const shareReferralHandler = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const user = await referralService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Referral link shared successfully",
      link: `http://localhost:4004/register?ref=${user.qrCode}`,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Generate Referral Code
export const generateReferralCodeHandler = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const qrCode = await referralService.generateReferralCode(userId);
    return res.status(201).json({
      message: "Referral code generated successfully",
      qrCode,
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Create Referral
export const createReferralHandler = async (req: Request, res: Response) => {
  try {
    await referralService.createReferral(req.body);
    return res.status(201).json({ message: "Referral created successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

// Fetch Referrals
export const fetchReferralsHandler = async (req: Request, res: Response) => {
  try {
    const referrals = await referralService.fetchReferrals(req.query, req.query.sortBy);
    return res.json(referrals);
  } catch (error) {
    handleError(error, res);
  }
};

// Track Referrals
export const trackReferralsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const referrals = await referralService.trackReferrals(userId);
    return res.json({ referrals });
  } catch (error) {
    handleError(error, res);
  }
};

// Get Leaderboard
export const getLeaderboardHandler = async (_req: Request, res: Response) => {
  try {
    const leaderboard = await referralService.getLeaderboard();
    return res.json(leaderboard);
  } catch (error) {
    handleError(error, res);
  }
};

// Get Rewards
export const getRewardsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const rewards = await referralService.getRewards(userId);
    return res.json(rewards);
  } catch (error) {
    handleError(error, res);
  }
};
