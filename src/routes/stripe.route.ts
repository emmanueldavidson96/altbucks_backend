import express from 'express';
import { createStripeCheckoutSession, confirmPaymentSuccessController, stripeOnboardingController, handleReturnUrl, handleCreateTransfer, handleCreatePayout } from '../controllers/stripe.controller';
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

//prefix : /api/stripe
router.post("/create-checkout-session", authenticate, createStripeCheckoutSession);
router.get("/payment-success", confirmPaymentSuccessController);
router.post('/stripe-onboarding', stripeOnboardingController);
router.get('/onboarding-complete', handleReturnUrl);
router.get('/create-transfer', handleCreateTransfer);
router.post('/create-payout', handleCreatePayout);

export default router;

