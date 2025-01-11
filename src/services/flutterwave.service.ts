const Flutterwave = require('flutterwave-node-v3');  //it lacks typescript support
import redis, { RedisClientType } from 'redis';
import dotenv from 'dotenv';
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY as string, process.env.FLW_SECRET_KEY as string);
import { ChargeCardRequest, BankTransferRequest} from '../controllers/flutterwave.controller';
import { getRedisClient } from '../config/redis-client';


dotenv.config();


interface BankTransferResponse {
    status: string;
    message: string;
    meta: {
      authorization: {
        transfer_reference: string;
        transfer_account: string;
        transfer_bank: string;
        account_expiration: string;
        transfer_note: string;
        transfer_amount: number;
        mode: string;
      };
    };
  }
  


const generateCustomAlphaNumericTxRef = (prefix: string): string => {
    const randomNumber = Math.floor(Math.random() * 1e8);
    const randomLetters = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}_${randomNumber}${randomLetters}`; 
};


export const bankTransferService = async(data: BankTransferRequest): Promise<BankTransferResponse> => {
    const {amount, currency, email,fullname,phone_number } =  data;
    const tx_ref = generateCustomAlphaNumericTxRef('TX');
    try{
        const banktransferdetails = {
            tx_ref: "dfs23fhr7ntg0293039_PMCK_ST_Fhyuuyuy",
            amount: amount,
            currency: currency,
            email: email,
            fullname: fullname,
            phone_number: phone_number,
        }
        const response = await flw.Charge.bank_transfer(banktransferdetails);
        if ( response.status !== "success"){
                throw new Error("Bank transfer initiation failed");
        }
        return response;
        
    }catch(error:any){

        console.error(error);
        throw new Error(error.message || "Internal Server Error");

    }
}



export const chargeCardService = async (data: ChargeCardRequest) => {
    const { card_number, cvv, expiry_month, expiry_year, amount, fullname, email, phone_number } = data;

    const tx_ref = generateCustomAlphaNumericTxRef('TX');
    console.log('Transaction Reference:', tx_ref);
    
    const transaction = { 
        tx_ref, card_number, cvv, expiry_month, expiry_year, amount, fullname, email, phone_number 
    };

    try {
        const client: RedisClientType = await getRedisClient();
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

        if (response.status === "error") {
            if (response.message.includes("Insufficient Funds")) {
                return {
                    status: 'error',
                    message: 'Insufficient funds. Please try another card or fund your card and try again.',
                    tx_ref,
                };
            }
        
            
            return {
                status: 'error',
                message: response.message || 'An unknown error occurred during the transaction.',
                tx_ref,
            };
        }

        
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

            if (authMode === 'avs_noauth') {
                const requiredFields = response.meta.authorization.fields;  
    
                return {
                    status: 'avs-data-required',
                    message: 'Please provide additional authorization data for the charge.',
                    required_fields: requiredFields,
                    tx_ref,
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
        const client: RedisClientType = await getRedisClient();
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
        } else if(!reCallCharge.meta){

            return { status: 'success', message: 'PIN submitted successfully.' }; 
        } else {
            throw new Error('Authorization data missing in response.');
        }

        // return { status: 'success', message: 'PIN submitted successfully.' };
    } catch (error:any) {
        throw new Error(`${error.message}`);
    }
};


export const submitAddressService = async (tx_ref: string, city: string, address: string, state: string, country:string, zipcode:string) => {
    try {
        const client: RedisClientType = await getRedisClient();
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
                mode: "avs_noauth",
                city: city,
                address: address,
                state: state,
                country: country,
                zipcode: zipcode
            },
            enckey: process.env.FLW_ENCRYPTION_KEY,
        };

      
        const reCallCharge = await flw.Charge.card(payload);

        console.log(reCallCharge);
        
     
        if (reCallCharge.meta && reCallCharge.meta.authorization) {
            const authMode = reCallCharge.meta.authorization.mode;
            if (authMode === 'otp') {
                return {
                    status: 'otp-required',
                    flw_ref: reCallCharge.data.flw_ref,
                };
            }

        if (authMode === 'redirect') {
                    return {
                        status: 'redirect-required',
                        redirect_url: reCallCharge.meta.authorization.redirect,
                        message: 'Please complete the transaction by entering the OTP.',
                    };
                }

        } else {
            throw new Error('Authorization data missing in response.');
        }

        return { status: 'success', message: 'Address verification data submitted successfully.' };
    } catch (error:any) {
        throw new Error(`Error in submitting address data: ${error.message}`);
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


