
import { Router } from "express";
import { handleWebhook } from "../controllers/flutterwavewebhook.controller";

const router = Router();


router.post("/webhook", handleWebhook);

export default router;
