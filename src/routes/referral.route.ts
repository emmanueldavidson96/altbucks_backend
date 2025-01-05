import express, { Router } from "express";
import {
  shareReferralHandler,
  createReferralHandler,
  generateReferralCodeHandler,
  fetchReferralsHandler,
  trackReferralsHandler,
  getLeaderboardHandler,
  getRewardsHandler,
} from "../controllers/referral.controller";

const referralRoutes = Router();

// Prefix: /referrals
referralRoutes.post("/share", shareReferralHandler);
referralRoutes.post("/", createReferralHandler);
referralRoutes.post("/generate-code", generateReferralCodeHandler);
referralRoutes.get("/", fetchReferralsHandler); // Example: GET /referrals?search=...&sortBy=...
referralRoutes.get("/:userId", trackReferralsHandler); // Example: GET /referrals/:userId
referralRoutes.get("/leaderboard", getLeaderboardHandler);
referralRoutes.get("/rewards/:userId", getRewardsHandler);

export default referralRoutes;
