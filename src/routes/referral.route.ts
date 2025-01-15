import express, { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware";
import {
  generateReferralCodeController,
  trackReferralsController,
  getReferralDetailsController,
  updateReferralActivityController,
  getRewardsController,
} from "../controllers/referral.controller";
import catchErrors from "../utils/catchErrors";

const router = express.Router();


router.post("/generate", catchErrors(verifyAccessToken), generateReferralCodeController);
router.post("/track", catchErrors(verifyAccessToken), trackReferralsController);
router.get("/:referralCode", catchErrors(verifyAccessToken), getReferralDetailsController);
router.put("/activity", catchErrors(verifyAccessToken), updateReferralActivityController);
router.get("/rewards", catchErrors(verifyAccessToken), getRewardsController);

export default router;
