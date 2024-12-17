import { Request, Response } from 'express';
import { Types } from 'mongoose'; 
import UserModel from '../models/user.model';
import TransactionLogModel from '../models/TransactionLog';
import { createPayout } from '../services/paypal-service';
import WalletModel, { Wallet } from '../models/task-earner-wallet.model';
import { createOrder, captureOrder } from "../services/paypal-service";
import { ApiError } from "@paypal/paypal-server-sdk";
import { updateTaskCreatorWallet, updateTaskEarnerWallet } from '../services/wallet.service';


export async function handleWithdrawal(req: Request, res: Response) {
    const { paypalEmail, amount } = req.body;

    try {
        
        const user = await UserModel.findById(req.user?.userId).populate('wallet');
        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }

        if (!user.wallet || (user.wallet instanceof  Types.ObjectId)) {
            return res.status(400).json({ message: "No wallet associated with the user"});
        }

        
        const wallet = user.wallet as Wallet;
        if (!wallet) {
            return res.status(400).json({ message: 'No wallet associated with the user' });
        }

        
        if (wallet.availableBalance< amount) {
            return res.status(400).json({ message: "Insufficient funds in your wallet" });
        }

        const payoutResponse = await createPayout(paypalEmail, amount);

        if (payoutResponse.batch_status !== 'SUCCESS') {
            return res.status(500).json({ message: 'Payout failed. please try again.'});
        }

        // wallet.availableBalance -= amount;
        // wallet.totalBalanceWithdrawn += amount;
        // await wallet.save();
        
        await updateTaskEarnerWallet(req.user?.userId as string, amount);

        
        const PayPaltransactionDate = new Date(payoutResponse.items[0].transaction_date); 

        const transactionLog = new TransactionLogModel({
            wallet: wallet._id,
            amount: amount,
            transactionType: 'debit',
            transactionDate: PayPaltransactionDate,
            description: `Withdrawal to ${paypalEmail}`,
        });
        await transactionLog.save();

        return res.status(200).json({
            message: 'Withdrawal successful'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred during the withdrawal process",
        });
    }
}



export async function createOrderHandler(req: Request, res: Response): Promise<void> {
    const { amount, currency } = req.body;
    let userId = req.user?.userId as string;

    if (!amount) {
        res.status(400).json({ message: "Amount is required." });
        return;
    }

    try {
        // Call the service to create the order
        const order = await createOrder(amount, currency, userId);

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

        const message =  error instanceof Error ? error.message : "An unknown error occurred.";

        res.status(500).json({
            message: "Failed to create order.",
            error: message,
        });
    }
}

export async function captureOrderHandler(req: Request, res: Response) {
    const { userId , orderId} = req.query;

    console.log(orderId);

    if (!orderId || typeof orderId !== "string") {
        return res.status(400).json({ message: "Order ID is required and must be a string." });
        
    }

    if (!userId || typeof userId !== 'string') {
        res.status(400).json({ message: "User ID is required and must be a string." });
        return;
    }

    try {
        
        const payment = await captureOrder(orderId);

        if (payment.status === "COMPLETED") {

            const amountCaptured = payment.purchaseUnits[0].amount.value;

            await updateTaskCreatorWallet(userId, parseFloat(amountCaptured));

            res.status(200).json({
                message: "Payment captured successfully and wallet updated!",
                // paymentData: payment,
                // updatedWallet: updatedWallet,
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