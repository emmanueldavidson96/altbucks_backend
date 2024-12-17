import express from 'express';
import { createStripeCheckoutSession , paymentSuccessController } from '../controllers/stripe-controller';

const router = express.Router();

//prefix : /api
router.post("/create-checkout-session", createStripeCheckoutSession );
router.get("/payment-success", paymentSuccessController);

export default router;

