import axios from "axios";
import { getCurrentToken } from "../utils/PaypalToken";

import paypalClient from "../config/Paypal-client";
import { OrdersController, ApiError, PaypalExperienceUserAction, OrderRequest, CheckoutPaymentIntent, OrderApplicationContextShippingPreference, ShippingPreference } from "@paypal/paypal-server-sdk";


const ordersController = new OrdersController(paypalClient);


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
    // total_amount: string;
    batch_status: string;
    items: Array<{
        payout_item_id: string;
        receiver: string;
        amount: string;
        transaction_status: string;
        note: string;
        transaction_date: string;
    }>;
}> => {
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
        console.log("PayPal API Response:", data);

        if (!data?.batch_header) {
            throw new Error("Invalid response structure from PayPal API:  Missing batch_header");
        }

        return {
            batch_id: data.batch_header.payout_batch_id,
            batch_status: data.batch_header.batch_status,
            items: data.items?.map((item: any) => ({
                payout_item_id: item.payout_item_id || "Unknown ID",
                receiver: item.payout_item?.receiver || "Unknown",
                amount: item.payout_item?.amount?.value || "0.00",
                transaction_status: item.transaction_status || "Unknown",
                note: item.payout_item?.note || "No note provided",
                transaction_date: item.time_processed || "Unknown date",
            })) || [],
        };
    } catch (error) {
        console.error(error);
        throw new Error("Error creating payout: " + (error as Error).message);
    }
};


// export async function createOrder(amount: string, currency = "USD", userId: string)  {
export async function createOrder(amount: string, currency = "USD")  {
    const orderRequest: OrderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
            {
                amount: {
                    currencyCode: currency,
                    value: amount,
                    breakdown: {
                        itemTotal: {
                            currencyCode: currency,
                            value: amount,
                        },
                    },
                },
                items: [
                    {
                        name: 'Task Creator Deposit',
                        description: 'Deposit made by the task creator on Alt Bucks',
                        quantity: '1',
                        unitAmount: {
                            currencyCode: currency,
                            value: amount,
                        },
                    },
                ],
            },
        ],
        paymentSource: {
            paypal: {
                experienceContext: {
                   
                    returnUrl:`https://2a5a-102-89-75-24.ngrok-free.app/api/paypal/orders/capture`,

                    cancelUrl: 'https://altbucks.com/cancel-deposit',
                    userAction: PaypalExperienceUserAction.PayNow,
                    shippingPreference: ShippingPreference.NoShipping,

                },
            },
        },
    };

    try {
        const { result, statusCode } = await ordersController.ordersCreate({
            body: orderRequest,
            prefer: 'return=representation',
        });



        if (statusCode !== 200) {

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



export async function captureOrder(orderId: string) {
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

// export async function captureOrder(orderId: string) {
//     const accessToken = await getCurrentToken();
    
//     try {
//         const response = await axios({
//             url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
//             method: 'post',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });
        
//         return response.data;  // Return the payment capture result from PayPal
//     } catch (error) {
//         console.error('Error capturing payment:', error);
//         throw new Error('Failed to capture payment. Please try again later.');
//     }
// }


