import express, { Router } from "express";
import {
  generateReferralCode,
  trackReferrals,
  getRewards,
  addReferralActivity,
  updateReferralActivity,
  getReferralActivities,

} from "../controllers/referral.controller";

const router = express.Router();

// Prefix: /referrals
router.post("/generate", generateReferralCode);
router.get("/:userId", trackReferrals); // Example: GET /referrals/:userId
router.get("/rewards/:userId", getRewards);
router.post("/activity", addReferralActivity); // Add new activity
router.patch("/activity", updateReferralActivity); // Update activity status
router.get("/activities", getReferralActivities); // Get all activities

export default router;
