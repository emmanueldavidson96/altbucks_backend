const Flutterwave = require('flutterwave-node-v3');  //it lacks typescript support
import redis, { RedisClientType } from 'redis';
import dotenv from 'dotenv';
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY as string, process.env.FLW_SECRET_KEY as string);
import { ChargeCardRequest } from '../controllers/flutterwave.controller';

dotenv.config();

// Initialize Redis client
const client: RedisClientType = redis.createClient();

client.on('error', (err:any) => console.error('Redis Client Error:', err));

(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
})();



const generateCustomAlphaNumericTxRef = (prefix: string): string => {
    const randomNumber = Math.floor(Math.random() * 1e8);
    const randomLetters = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}_${randomNumber}${randomLetters}`; 
};



export const chargeCardService = async (data: ChargeCardRequest) => {
    const { card_number, cvv, expiry_month, expiry_year, amount, fullname, email, phone_number } = data;

    const tx_ref = generateCustomAlphaNumericTxRef('TX');
    console.log('Transaction Reference:', tx_ref);
    
    const transaction = { 
        tx_ref, card_number, cvv, expiry_month, expiry_year, amount, fullname, email, phone_number 
    };

    try {
        await client.set(tx_ref, JSON.stringify(transaction), { EX: 3600 });

        const payload = {
            card_number,
            cvv,
            expiry_month,
            expiry_year,
            currency: 'NGN',
            amount,
            fullname,
            email,
            phone_number,
            enckey: process.env.FLW_ENCRYPTION_KEY as string,
            tx_ref,
            // redirect_url: 'https://yourdomain.com/callback-url'
        };

        
        const response = await flw.Charge.card(payload);
        console.log('Charge Response:', JSON.stringify(response, null, 2));

        
        if (response.meta.authorization) {
            const authMode = response.meta.authorization.mode;

            if (authMode === 'pin') {
                return {
                    status: 'pin-required',
                    message: 'PIN authorization is required',
                    tx_ref,
                };
            }

            if (authMode === 'redirect') {
                return {
                    status: 'redirect-required',
                    redirect_url: response.meta.authorization.redirect,
                };
            }
        }

        
        return {
            status: 'successful',
            message: 'Transaction successful',
            data: response.data,
        };
    } catch (error:any) {
        console.error('Charge Card Error:', error.response?.data || error.message);
        throw new Error('Transaction failed. Please try again.');
    }
};



export const submitPinService = async (tx_ref: string, pin: string) => {
    try {
        const transactionData = await client.get(tx_ref);
        if (!transactionData) {
            throw new Error('Transaction not found.');
        }

        const transaction = JSON.parse(transactionData);
        const { amount, card_number, cvv, expiry_month, expiry_year, fullname, email, phone_number } = transaction;

        const payload = {
            tx_ref,
            amount,
            card_number,
            cvv,
            expiry_month,
            expiry_year,
            currency: 'NGN',
            fullname,
            email,
            phone_number,
            authorization: {
                mode: 'pin',
                pin,
            },
            enckey: process.env.FLW_ENCRYPTION_KEY,
        };

      
        const reCallCharge = await flw.Charge.card(payload);
        
     
        if (reCallCharge.meta && reCallCharge.meta.authorization) {
            const authMode = reCallCharge.meta.authorization.mode;
            if (authMode === 'otp') {
                return {
                    status: 'otp-required',
                    flw_ref: reCallCharge.data.flw_ref,
                };
            }
        } else {
            throw new Error('Authorization data missing in response.');
        }

        return { status: 'success', message: 'PIN submitted successfully.' };
    } catch (error:any) {
        throw new Error(`Error in submitting PIN: ${error.message}`);
    }
};


export const submitOtpService = async (otp: string, flw_ref: string) => {
    try {
        const otpResponse = await flw.Charge.validate({
            otp: otp,
            flw_ref: flw_ref,
        });

        console.log('OTP Validation Response:', otpResponse);

        if (otpResponse.status === 'success') {
            return {
                status: 'transaction-successful',
                data: otpResponse.data,
            };
        } else {
            throw new Error('OTP verification failed.');
        }
    } catch (error:any) {
        throw new Error(`Error in OTP validation: ${error.message}`);
    }
};


