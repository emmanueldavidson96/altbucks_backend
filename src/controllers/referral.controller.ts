import { Request, Response } from "express";
import referralService from "../services/referral.service";
import catchErrors from "../utils/catchErrors";
import { CREATED, OK, UNAUTHORISED } from "../constants/http";
import { verifyToken, AccessTokenPayload } from "../utils/jwt";
import appAssert from "../utils/appAssert";
import { Types } from "mongoose";
import User from "../models/user.model";
import Referral from "../models/referral.model"; // Assuming there's a referral model

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

// Controller for sharing referral link
export const shareReferral = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const user = await User.findById(userId);
    appAssert(user, UNAUTHORISED, "User not found");

    res.status(OK).json({
        message: "Referral link generated successfully",
        referralLink: `http://yourapp.com/register?ref=${user.qrCode}`,
    });
});

// Controller for creating a referral
export const createReferral = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const { referredUserId } = req.body;
    appAssert(referredUserId, UNAUTHORISED, "Referred user ID is required");

    // Create a referral
    const referral = new Referral({
        userId,
        referredUserId: new Types.ObjectId(referredUserId),
    });

    await referral.save();
    res.status(CREATED).json({ message: "Referral created successfully" });
});

// Controller for fetching referrals
export const fetchReferrals = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const referrals = await Referral.find({ userId }).populate("referredUserId");
    res.status(OK).json({ referrals });
});

export const generateReferralCode = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const user = await User.findById(userId);
    appAssert(user, UNAUTHORISED, "User not found");

    // Generate a unique referral code (e.g., based on the user's ID or username)
    const referralCode = `REF-${user._id.toString().slice(-6)}`;

    // Save the referral code to the user document
    user.qrCode = referralCode;
    await user.save();

    res.status(CREATED).json({
        message: "Referral code generated successfully",
        referralCode,
    });
});

export const trackReferrals = catchErrors(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { userId } = verifyAccessToken(accessToken);

    const referrals = await Referral.find({ userId }).populate("referredUserId", "username email");
    res.status(OK).json({
        message: "Referrals tracked successfully",
        referrals,
    });
});

export const getLeaderboard = catchErrors(async (_req: Request, res: Response) => {
    const leaderboard = await Referral.aggregate([
        {
            $group: {
                _id: "$userId",
                totalReferrals: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $project: {
                username: "$user.username",
                email: "$user.email",
                totalReferrals: 1,
            },
        },
        { $sort: { totalReferrals: -1 } },
        { $limit: 10 }, // Top 10 users
    ]);

    res.status(OK).json({
        message: "Leaderboard fetched successfully",
        leaderboard,
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
