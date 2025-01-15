import { Request, Response } from 'express';
import { createPayout } from '../services/paypal.service';

import { createOrder, captureOrder } from "../services/paypal.service";
import { ApiError } from "@paypal/paypal-server-sdk";


export async function handleWithdrawal(req: Request, res: Response) {
    const { paypalEmail, amount } = req.body;

    try {
        const payoutResponse = await createPayout(paypalEmail, amount);

        if (payoutResponse.batch_status === 'PENDING') {
            return res.status(500).json({
                message: 'Payment is being processed. Please check your Paypal wallet.',
                payout_batch_id: payoutResponse.batch_id,
            });
        }
        if (payoutResponse.batch_status === 'SUCCESS') {
            return res.status(200).json({
                message: 'Withdrawal successful',
            });
        }

      

        return res.status(500).json({
            message: 'Payment failed. Please try again.',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred during the withdrawal process",
        });
    }
}



export async function createOrderHandler(req: Request, res: Response)  {
    const { amount, currency } = req.body;
    // const userId = req.user?.userId as string;

    if (!amount) {
        res.status(400).json({ message: "Amount is required." });
        return;
    }

    try {
       
        const order = await createOrder(amount, currency);

         const approveLink = order.links?.find((link: { rel: string }) => link.rel === "payer-action")?.href;

         if (!approveLink) {
            return res.status(400).json({
                message: "Approval link is missing.",
            });
        }

        
        res.status(201).json({
            message: "Order created successfully!",
            data: {
                id: order.id,
                status: order.status,
                links: approveLink,
            },
        });
    } catch (error) {
        console.error("Failed to create order:", error);

        const message = error instanceof Error ? error.message : "An unknown error occurred.";

        res.status(500).json({
            message: "Failed to create order.",
            error: message,
        });
    }
}

export async function captureOrderHandler(req: Request, res: Response) {
    
    try {

        const payment = await captureOrder(req.query.token as string);

        if (payment.status === "COMPLETED") {


            

            res.status(200).json({
                message: "Payment captured successfully",
               
            });
        } else {

            res.status(400).json({
                message: "Payment capture failed. Please try again later.",
            });
        }
    } catch (error) {

        console.error("Failed to capture payment:", error);

        if (error instanceof ApiError) {

            console.error("PayPal API Error:", error.message, error.result);

            res.status(400).json({
                message: "Failed to capture payment. Please try again later.",
            });
        } else {

            console.error("Unexpected error:", error);

            res.status(500).json({
                message: "An unexpected error occurred. Please try again later.",
            });
        }
    }
}


