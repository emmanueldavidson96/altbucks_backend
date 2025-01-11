import { Request, Response } from 'express';
import { chargeCardService, bankTransferService, submitPinService, submitOtpService, submitAddressService  } from '../services/flutterwave.service'; 
import { z } from 'zod';

const ChargeCardSchema = z.object({

    card_number: z.string().regex(/^\d{16,}$/, "Card number must be at least 16 digits"),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 digits"),
    expiry_month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid expiry month"),
    expiry_year: z.string().regex(/^\d{2}$/, "Invalid expiry year"),
    amount: z.number().min(1, "Amount must be greater than 0"),
    fullname: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone_number: z.string().min(1, "Phone number is required"),
});

const BankTransferSchema = z.object({
    amount: z.string().min(1, "Amount must be greater than 0"),
    currency: z.string().min(1, "Currency is required").default("NGN"), // Default to NGN
    email: z.string().email("Invalid email address"),
    fullname: z.string().min(1, "Full name is required"),
    phone_number: z.string().min(1, "Phone number is required"),
  });

export type ChargeCardRequest = z.infer<typeof ChargeCardSchema>;
export type BankTransferRequest = z.infer<typeof BankTransferSchema>;


export const BankTransferController = async (req: Request, res: Response) => {
    try {
        
        const parsedData = BankTransferSchema.parse(req.body);

        
        const response = await bankTransferService(parsedData);

        const { transfer_account, transfer_bank, transfer_amount } = response.meta.authorization;
        res.status(200).json({ transfer_account, transfer_bank, transfer_amount});
    } catch (error: any) {
        if (error instanceof z.ZodError) {
           
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
    
};

export const chargeCardController = async (req: Request, res: Response) => {
    try {
        
        const parsedData = ChargeCardSchema.parse(req.body);

        
        const response = await chargeCardService(parsedData);

        return res.json(response);
    } catch (error) {
        if (error instanceof z.ZodError) {
           
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        console.error('Charge Card Controller Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const submitPinController = async (req: Request, res: Response) => {
    const { pin, tx_ref } = req.body;

    console.log('tx_ref received:', tx_ref);

    if (!tx_ref || !pin) {
        return res.status(400).json({ error: 'Transaction reference and PIN are required.' });
    }

    try {
        const result = await submitPinService(tx_ref, pin);
        return res.json(result);  // Send the response back to the client
    } catch (error: any) {
        console.error('Error in submitting PIN:', error.message);
        return res.status(500).json({ error: 'Transaction failed. Please try again.' });
    }
};





export const submitOtpController = async (req: Request, res: Response) => {
    const { otp, flw_ref } = req.body;

    if (!flw_ref || !otp) {
        return res.status(400).json({ error: 'Flutterwave reference and OTP are required.' });
    }

    try {
        const result = await submitOtpService(otp, flw_ref);
        return res.json(result); 
    } catch (error: any) {
        console.error('Error in OTP validation:', error.message);
        return res.status(500).json({ error: 'Something went wrong with OTP validation.' });
    }
};

export const submitAddressController = async (req: Request, res: Response) => {
    const { tx_ref, city, address, state, country, zipcode } = req.body;

    console.log('tx_ref received:', tx_ref);

    if (!tx_ref || !city || !address || !state || !country || !zipcode) {
        return res.status(400).json({
            error: 'Transaction reference and all address fields (city, address, state, country, zipcode) are required.',
        });
    }

    try {
        const result = await submitAddressService(tx_ref, city, address, state, country, zipcode);
        return res.json(result); 
    } catch (error: any) {
        console.error('Error in submitting address data:', error.message);
        return res.status(500).json({ error: 'Transaction failed. Please try again.' });
    }
};
