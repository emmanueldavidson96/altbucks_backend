import express, { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Referral from "../models/referral.model";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { CREATED, OK, UNAUTHORISED, CONFLICT, NOT_FOUND } from "../constants/http";
import { verifyToken, AccessTokenPayload } from "../utils/jwt";
import {
  generateReferralCode,
  trackReferrals,
  getReferralDetails,
  updateReferralActivity,
  getRewards,
} from "../services/referral.service";

const router = express.Router();


// Middleware to verify access token
const verifyAccessToken = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  appAssert(authHeader, UNAUTHORISED, "Authorization header is required");

  const token = authHeader.split(" ")[1];
  appAssert(token, UNAUTHORISED, "Access token is required");

  const { payload, error } = verifyToken<AccessTokenPayload>(token);
  appAssert(!error && payload, UNAUTHORISED, "Invalid access token");

  const typedPayload = payload as AccessTokenPayload;
  appAssert(typedPayload.userId, UNAUTHORISED, "Invalid token payload");

  // Convert string ID to ObjectId and attach to req.user
  req.user = { id: new Types.ObjectId(typedPayload.userId.toString()) };
  next();
});

// Generate Referral Code
  export const generateReferralCodeController = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id; // Populated by verifyAccessToken
    appAssert(userId, UNAUTHORISED, "User not authenticated");
    const code = await generateReferralCode(userId.toString());
    res.status(CREATED).json({ message: "Referral code generated successfully", code });
  });


// Track Referrals
export const trackReferralsController = catchErrors(async (req: Request, res: Response) => {
    const { referralCode, referredUserId } = req.body;
    const result = await trackReferrals(referralCode, referredUserId);
    res.status(CREATED).json(result);
  });

// Get Referral Details
export const getReferralDetailsController = catchErrors(async (req: Request, res: Response) => {
    const { referralCode } = req.params;
    const details = await getReferralDetails(referralCode);
    res.status(OK).json(details);
  });

// Update Referral Activity
export const updateReferralActivityController = catchErrors(async (req: Request, res: Response) => {
    const { referredUserId, status } = req.body;
    const userId = req.user?.id; // Populated by verifyAccessToken
    appAssert(userId, UNAUTHORISED, "User not authenticated");
    const result = await updateReferralActivity({ userId: userId.toString(), referredUserId, status });
    res.status(OK).json(result);
  })

// Get Rewards
export const getRewardsController = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id; // Populated by verifyAccessToken
    appAssert(userId, UNAUTHORISED, "User not authenticated");
    const rewards = await getRewards(userId.toString());
    res.status(OK).json(rewards);
  });


export default router;


