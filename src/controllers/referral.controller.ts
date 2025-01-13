
import Referral from "../models/referral.model";
import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { CREATED, OK, UNAUTHORISED } from "../constants/http";
import { verifyToken, AccessTokenPayload } from "../utils/jwt";
import { Types } from "mongoose";
import { CONFLICT, NOT_FOUND } from "../constants/http";


// Helper function to verify user access token
const verifyAccessToken = (accessToken: string | undefined) => {
    appAssert(accessToken, UNAUTHORISED, "No access token provided");

    const { payload, error } = verifyToken<AccessTokenPayload>(accessToken);
    appAssert(!error && payload, UNAUTHORISED, "Invalid access token");

    // Type assertion since we know the structure from JWT utils
    const typedPayload = payload as AccessTokenPayload;
    appAssert(typedPayload.userId, UNAUTHORISED, "Invalid token payload");

    // Convert string ID to ObjectId
    const userId = new Types.ObjectId(typedPayload.userId.toString());
    return { ...typedPayload, userId };
};

export const generateReferralCode = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);


    // Check if the user already has a referral
    const existingReferral = await Referral.findOne({ user: userId });
    if (existingReferral) {
        return res.status(OK).json({
            message: "Referral code already exists",
            referralCode: existingReferral.qrCode,
        });
    }


    // Generate a unique referral code
    const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;


    // Create and save the referral
    const newReferral = await Referral.create({
        user: userId,
        code: referralCode,
    });


    res.status(CREATED).json({
        message: "Referral code generated successfully",
        referralCode: newReferral.qrCode,
    });
});

export const trackReferrals = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    // Fetch referrals linked to the user
    const referrals = await Referral.findOne({ user: userId }).populate("referredUsers");

    appAssert(referrals, UNAUTHORISED, "No referrals found");

    res.status(OK).json({
        message: "Referrals fetched successfully",
        referrals,
    });
});

export const addReferralActivity = catchErrors(async (req: Request, res: Response) => {
    const { referralCode, referredUserId } = req.body;

    // Find the referral by code
    const referral = await Referral.findOne({ code: referralCode });
    appAssert(referral, UNAUTHORISED, "Invalid referral code");

    // Check if the user is already referred
    const existingActivity = referral.activities.find(
        (activity) => activity.referredUser.toString() === referredUserId
    );
    appAssert(!existingActivity, CONFLICT, "User is already referred");

    // Add a new activity
    referral.activities.push({
        referredUser: referredUserId,
        status: "pending",
        createdAt: new Date(),
    });
    await referral.save();

    res.status(CREATED).json({
        message: "Referral activity added successfully",
    });
});

export const updateReferralActivity = catchErrors(async (req: Request, res: Response) => {
    const { referralCode, referredUserId, status } = req.body;

    // Find the referral by code
    const referral = await Referral.findOne({ code: referralCode });
    appAssert(referral, UNAUTHORISED, "Invalid referral code");

    // Find the activity and update its status
    const activity = referral.activities.find(
        (activity) => activity.referredUser.toString() === referredUserId
    );
    appAssert(activity, NOT_FOUND, "Referral activity not found");

    activity.status = status;
    if (status === "active") {
        activity.activatedAt = new Date();
    }

    await referral.save();

    res.status(OK).json({
        message: "Referral activity updated successfully",
        activity,
    });
});

export const getReferralActivities = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const referral = await Referral.findOne({ user: userId }).populate("activities.referredUser");
    appAssert(referral, UNAUTHORISED, "No referral found");

    res.status(OK).json({
        message: "Referral activities fetched successfully",
        activities: referral.activities,
    });
});

export const getRewards = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const referrals = await Referral.find({ userId });
    const totalReferrals = referrals.length;

    // Example reward logic
    const rewards = {
        totalReferrals,
        earnedRewards: totalReferrals * 5, // Assume $5 reward per referral
    };

    res.status(OK).json({
        message: "Rewards fetched successfully",
        rewards,
    });
});