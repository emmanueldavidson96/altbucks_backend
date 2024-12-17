import express from "express";
import { getWalletDetailsController, getTaskCreatorWalletDetailsController } from "../controllers/wallet.controller";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

//prefix : /api
router.get("/wallet/balance", authenticate,getWalletDetailsController);
router.get("/wallet/balance", authenticate,getTaskCreatorWalletDetailsController);


export default router;
