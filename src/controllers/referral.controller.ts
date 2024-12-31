import { Request, Response } from "express";
import { createReferralWithActivity } from "../services/referral.service";

export const createReferralHandler = async (req: Request, res: Response) => {
  try {
    const referral = await createReferralWithActivity();
    return res.status(201).json(referral);
  } catch (error) {
    console.error("Error creating referral:", error);
    return res.status(500).json({ message: "Failed to create referral." });
  }
};
