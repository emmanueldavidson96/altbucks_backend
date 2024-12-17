import express from 'express';
import { handleWithdrawal, captureOrderHandler,createOrderHandler } from "..//controllers/paypal-controller"
const router = express.Router();






router.post("/withdrawal", handleWithdrawal);
router.post("/orders", createOrderHandler);
router.post("/orders/:orderId/capture", captureOrderHandler);

export default router;
