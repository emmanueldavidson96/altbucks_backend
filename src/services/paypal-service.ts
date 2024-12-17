import { getCurrentToken } from "../utils/PaypalToken";
import paypalClient from "../config/Paypal-client";
import { OrdersController, ApiError, CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";


interface PayoutResponse {
    batch_header: {
        payout_batch_id: string;    
        batch_status: string;       
        amount: {
            currency: string;       
            value: string;          
        };
    };
    items: Array<{
        payout_item_id: string;     
        transaction_status: string; 
        payout_item: {
            receiver: string;
            amount: {
                currency: string;
                value: string;
            };
            note: string;           
        };
        time_processed: string;     
    }>;
}

export const createPayout = async (recipientEmail: string, amount: string): Promise<{
    batch_id: string;
    total_amount: string;
    batch_status: string;
    items: Array<{
        payout_item_id: string;
        receiver: string;
        amount: string;
        transaction_status: string;
        note: string;
        transaction_date:string;
    }>;
}> => {
    // Get the valid token before making the payout request
    const token = await getCurrentToken();
    console.log(token);

    const payoutData = {
        sender_batch_header: {
            sender_batch_id: `Payouts_${Date.now()}`,
            email_subject: "You have a payout!",
            email_message: "You have received a payout! Thanks for using our service!",
        },
        items: [
            {
                recipient_type: "EMAIL",
                amount: { value: amount, currency: "USD" },
                note: "Thanks for your patronage!",
                sender_item_id: `item_${Date.now()}`,
                receiver: recipientEmail,
                notification_language: "en-US",
            },
        ],
    };

    // Send the payout request to PayPal
    try {
        const response = await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
            body: JSON.stringify(payoutData),
        });

        if (!response.ok) { 
            throw new Error(`PayPal payout request failed: ${response.statusText}`);
        }

        const data: PayoutResponse = await response.json();

        return {
            batch_id: data.batch_header.payout_batch_id,
            total_amount: data.batch_header.amount.value,
            batch_status: data.batch_header.batch_status,
            items: data.items.map(item => ({
                payout_item_id: item.payout_item_id,
                receiver: item.payout_item.receiver,
                amount: item.payout_item.amount.value,
                transaction_status: item.transaction_status,
                note: item.payout_item.note,
                transaction_date: item.time_processed,
            })),
        };
    } catch (error) {
        console.error(error);
        throw new Error("Error creating payout: " + (error as Error).message);
    }
};

const ordersController = new OrdersController(paypalClient);

export async function createOrder(amount: string, currency = "USD", userId: string): Promise<any> {
    const orderRequest = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: currency,
                        value: amount,
                    },
                },
            ],
              // for production purpose to include the return_url
            /*
            application_context: {
                return_url: "https://yourdomain.com/paypal/return?userId=${encodeURIComponent(userId)}",  //  where user should be redirected after approval.
                cancel_url: "https://yourdomain.com/paypal/cancel",  //  where user should be redirected if user cancel the payment on PayPal
            }
            */
        },
        prefer: "return=minimal",
    };

    try {
        const { result, statusCode} = await ordersController.ordersCreate(orderRequest);



        if (statusCode !== 201) {

            console.error("Unexpected status code:", statusCode);
            throw new Error(`Order creation failed with status code ${statusCode}`);
        }

        console.log("Order Created Successfully:", result);
        
        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("PayPal API Error:", error);

            const errors = error.result;

            console.error("Error Details:", errors);

            throw new Error("Failed to create order. Please try again later.");
        }
        console.error("Unexpected Error:", error);

        throw new Error("An unexpected error occurred. Please try again later.");
    }
}



export async function captureOrder(orderId: string): Promise<any> {
    try {
        // request object based on the PayPal documentation
        const collect = {
            id: orderId,
            prefer: 'return=minimal'
        };

        const { result, ...httpResponse } = await ordersController.ordersCapture(collect);

        console.log("Response Status Code:", httpResponse.statusCode);

        return result;
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("PayPal API Error:", error.message, error.result);
            
            throw new Error("Failed to capture payment. Please try again later.");
        }

        console.error("Unexpected Error:", error);

        throw new Error("An unexpected error occurred. Please try again later.");
    }
}


