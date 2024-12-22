import { z } from "zod";
import mongoose from 'mongoose';
import BankDetailsModel from "../models/BankDetails.model";
import { BankDetails } from "../models/BankDetails.model";

const bankDetailsSchema = z.object({
    beneficiary: z.string().min(1, "Beneficiary name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    bankShortCode: z.string().min(1, "Bank short code is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    country: z.string().min(1, "Country is required"),
    userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid user ID format",
    }),
});

export const addBankDetails = async (
    beneficiary: string,
    bankName: string,
    bankShortCode: string,
    accountNumber: string,
    country: string,
    userId: string
): Promise<BankDetails> => {
    const validatedData = bankDetailsSchema.parse({
        beneficiary,
        bankName,
        bankShortCode,
        accountNumber,
        country,
        userId
    });


    const userObjectId = new mongoose.Types.ObjectId(validatedData.userId);

    const bankDetails = new BankDetailsModel({
        beneficiary,
        bankName,
        bankShortCode,
        accountNumber,
        country,
        user: userObjectId,
    });

    try {
        const savedBankDetails = await bankDetails.save();
        return savedBankDetails;
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            throw new Error("Error saving bank details: " + error.message);
        } else {
            throw new Error("Unknown error occurred while saving bank details.");
        }
    }
};

