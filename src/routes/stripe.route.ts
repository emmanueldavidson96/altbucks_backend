import express from 'express';
import { createStripeCheckoutSession, confirmPaymentSuccessController, stripeOnboardingController, handleReturnUrl, handleCreateTransfer, handleCreatePayout } from '../controllers/stripe.controller';
import { authenticate } from "../middleware/authenticate";

const stripeRouter = express.Router();

//prefix : /api/stripe
stripeRouter.post("/create-checkout-session", createStripeCheckoutSession);
stripeRouter.get("/payment-success", confirmPaymentSuccessController);
stripeRouter.post('/stripe-onboarding', stripeOnboardingController);
stripeRouter.get('/onboarding-complete', handleReturnUrl);
stripeRouter.get('/create-transfer', handleCreateTransfer);
stripeRouter.post('/create-payout', handleCreatePayout);

export default stripeRouter;

