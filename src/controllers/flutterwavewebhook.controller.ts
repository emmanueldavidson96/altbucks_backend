// src/controllers/webhookController.ts

import { Request, Response } from "express";
import { verifySignature, processWebhookEvent } from "../services/flutterwavewebhook.service";

const secretHash = "MY_FLUTTERWAVE_SECRET_HASH"; // Replace with your secret hash

export const handleWebhook = (req: Request, res: Response) => {

    console.log("Received headers:", req.headers);
    console.log("Request body:", req.body);
    const signature = req.headers["verif-hash"] as string | undefined;

    
    if (!verifySignature(signature, secretHash)) {
        res.status(403).send("Forbidden: Invalid signature");
        return;
    }

    const { event, data } = req.body;

    console.log(`Received event: ${event}`);
    console.log("Data:", data);

    
    processWebhookEvent(event, data);

    
    res.status(200).send("Webhook received and processed successfully.");
};
