import { Request, Response, NextFunction } from "express";
import catchErrors from "../utils/catchErrors";
import { addBankDetails } from "../services/bankdetails.service";
import { CREATED, NOT_FOUND } from "../constants/http";

export const addBankDetailsController = catchErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        const { beneficiary, bankName, bankShortCode, accountNumber, country } = req.body;

        const userId = req.user?.userId as string;
        
        if (!userId) {
            return res.status(NOT_FOUND).json({ message: "User not found" });
        }
    
        const bankDetails = await addBankDetails(beneficiary, bankName, bankShortCode, accountNumber, country, userId);

        return res.status(CREATED).json({
            message: "Bank details added successfully",
            data: bankDetails
        });
    }
);

