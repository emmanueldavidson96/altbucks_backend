import Stripe from "stripe";
import { updateTaskCreatorWallet } from "../services/wallet.service";
const stripe = new Stripe("sk_test_51QVVHVRpLXhxt61JIPWMR2nIoKNQrU85z0ISWzYsUU7a4agUEpVhb9SnEoAGoXP4TbliyaJzmILSVfu3EE6AdLmh00fcWgXvVS", {
    apiVersion: '2024-11-20.acacia',
  });

  


 export const DOMAIN_ADDRESS = "http://localhost:4242";
const BACKEND_URL = "https://6b77-102-89-68-175.ngrok-free.app";


export const createStripeSession = async (amount: number, userId:string): Promise<Stripe.Checkout.Session | null> => {

    if (isNaN(amount) || amount <= 0) {
        return null;
      }
      const unitAmount = Math.round(amount * 100);
   
    try {
        
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'User Deposit',
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${BACKEND_URL}/api/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN_ADDRESS}/cancel.html`,
            metadata: { userId: userId },
        });

        return session;
    } catch (error: any) {
        console.error("Error creating Stripe session: ", error.message);
        return null;
    }
};

export const confirmStripeSession = async (sessionId: string) => {

    if (!sessionId) {
        throw new Error("Session ID is required");
      }
    
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session;

      } catch (error) {
        console.error("Error retrieving Stripe session:", error);

        throw new Error("Error retrieving payment session");
      }
    };

    export const processPayment = async (sessionId: string) => {
        try {
       
             const session = await confirmStripeSession(sessionId);
       
             if (!session.metadata || !session.metadata.userId){
       
                throw new Error("User ID not found in session metadata");
             }
       
             const userId = session.metadata.userId;
       
             if (session.payment_status === 'paid' && session.amount_total != null)  {
               
               const amountPaid = session.amount_total/100;
       
                await updateTaskCreatorWallet(userId, amountPaid);
       
               return { success: true, message: "Payment successful and wallet updated"};
             } else {
                throw new Error('Payment not completed or failed');
             }
           } catch (error:any) {
             console.error("Error processing payment: ", error);
             return { success: false, message: error.message };
           }
         };



  