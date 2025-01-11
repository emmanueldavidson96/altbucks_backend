import { Router } from 'express';
import { handleWithdrawal, captureOrderHandler, createOrderHandler } from "../controllers/paypal.controller";
import { authenticate } from "../middleware/authenticate";
const paypalRouter = Router();


//prefix : /api/paypal
paypalRouter.post("/withdrawal", handleWithdrawal);
paypalRouter.post("/orders", createOrderHandler);
paypalRouter.get("/orders/capture", captureOrderHandler);

export default paypalRouter;
