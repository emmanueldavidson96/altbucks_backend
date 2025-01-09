import express, { Router } from "express";
import {
  shareReferral,
  createReferral,
  generateReferralCode,
  fetchReferrals,
  trackReferrals,
  getLeaderboard,
  getRewards,
} from "../controllers/referral.controller";

const router = express.Router();

// Prefix: /referrals
router.post("/share", shareReferral);
router.post("/", createReferral);
router.post("/generate-code", generateReferralCode);
router.get("/", fetchReferrals); // Example: GET /referrals?search=...&sortBy=...
router.get("/:userId", trackReferrals); // Example: GET /referrals/:userId
router.get("/leaderboard", getLeaderboard);
router.get("/rewards/:userId", getRewards);

export default router;
