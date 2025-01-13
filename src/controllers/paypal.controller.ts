import { Request, Response } from 'express';
import { Types } from 'mongoose';
import UserModel from '../models/user.model';
import { createPayout } from '../services/paypal.service';

import { createOrder, captureOrder } from "../services/paypal.service";
import { ApiError } from "@paypal/paypal-server-sdk";
import { any } from 'zod';


export async function handleWithdrawal(req: Request, res: Response) {
    const { paypalEmail, amount } = req.body;

    try {

        // const user = await UserModel.findById(req.user?.userId).populate('wallet');
        // if (!user) {
        //     return res.status(404).json({ message: "User not found" });
        // }

        // if (!user.wallet || (user.wallet instanceof Types.ObjectId)) {
        //     return res.status(400).json({ message: "No wallet associated with the user" });
        // }


        // const wallet = user.wallet as Wallet;
        // if (!wallet) {
        //     return res.status(400).json({ message: 'No wallet associated with the user' });
        // }


        // if (wallet.availableBalance < amount) {
        //     return res.status(400).json({ message: "Insufficient funds in your wallet" });
        // }

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
        // Call the service to create the order
        // const order = await createOrder(amount, currency, userId);
        const order = await createOrder(amount, currency);

        //  const approveLink = order.links.find((link: { rel: string }) => link.rel === "approve")?.href;

        //  if (approveLink) {
        //      // Redirect the user to PayPal's approval page
        //      res.redirect(approveLink);
        //  } else {
        //      // If the approve link is not found, return an error response
        //      res.status(500).json({ message: "Approval link not found. Order creation failed." });
        //  }

        // Return a structured response with created order details
        res.status(201).json({
            message: "Order created successfully!",
            data: {
                id: order.id,
                status: order.status,
                links: order.links,
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

// export async function createOrderHandler(req: Request, res: Response) {
//     const { amount, currency } = req.body;

//     if (!amount) {
//         res.status(400).json({ message: "Amount is required." });
//         return;
//     }

//     try {
//         const order = await createOrder(amount, currency);

//         // Store the order ID in Redis using a unique key (e.g., userId or sessionId)
//         const orderId = order.id;
//         await redis.set(`orderId:${orderId}`, orderId, 'EX', 3600);  // TTL of 1 hour

//         res.status(201).json({
//             message: "Order created successfully!",
//             data: {
//                 id: order.id,
//                 status: order.status,
//                 links: order.links,
//             },
//         });
//     } catch (error) {
//         console.error("Failed to create order:", error);

//         const message = error instanceof Error ? error.message : "An unknown error occurred.";

//         res.status(500).json({
//             message: "Failed to create order.",
//             error: message,
//         });
//     }
// }

// export async function captureOrderHandler(req: Request, res: Response) {
//     try {
//         const { orderId } = req.query;

//         if (!orderId) {
//             return res.status(400).json({ message: 'Order ID is required.' });
//         }

//         // Retrieve the order ID from Redis
//         const redisOrderId = await redis.get(`orderId:${orderId}`);

//         if (!redisOrderId) {
//             return res.status(400).json({ message: 'Order ID not found in Redis.' });
//         }

//         // Capture the payment using the orderId retrieved from Redis
//         const captureResult = await captureOrder(redisOrderId);

//         await redis.del(`orderId:${orderId}`);

//         res.status(200).json({
//             message: 'Payment captured successfully!',
//             data: captureResult,
//         });
//     } catch (error) {
//         console.error("Error capturing payment:", error);

//         res.status(500).json({
//             message: 'Failed to capture payment.',
//             // error: error.message,
//         });
//     }
// }


