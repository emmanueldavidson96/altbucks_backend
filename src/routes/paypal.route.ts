import express from 'express';
import { handleWithdrawal, captureOrderHandler, createOrderHandler } from "../controllers/paypal.controller";
import { authenticate } from "../middleware/authenticate";
const router = express.Router();


//prefix : /api/paypal
router.post("/withdrawal", authenticate, handleWithdrawal);
router.post("/orders", authenticate, createOrderHandler);
router.post("/orders/:orderId/capture", captureOrderHandler);

export default router;
