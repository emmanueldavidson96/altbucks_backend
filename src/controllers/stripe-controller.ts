import { Request, Response} from "express";
import { createStripeSession, processPayment } from "../services/stripe-service";
import { DOMAIN_ADDRESS } from "../services/stripe-service";



export const createStripeCheckoutSession = async (req:Request, res:Response) => {
    const { amount } = req.body;
    let userId = req.user?.userId as string; 

    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0){
        return  res.status(400).send("Invalid amount. Please provide a positive value.");

    }

    if (!userId) {
        return res.status(400).send("User not authenticated.");
    }
    
    try {
        const stripeSession = await createStripeSession(numericAmount, userId);

        if(!stripeSession || !stripeSession.url) {

            return res.status(500).send("Something went wrong while creating the session.");
        }

        
        const sessionUrl = stripeSession.url;
        console.log(sessionUrl);

        res.redirect(303, sessionUrl);
        
    }catch (error: any) {
        console.error(error.message);
        res.status(500).send(error.message || "Something went wrong while creating the session.")
    }
};

export const paymentSuccessController = async (req: Request, res: Response) => {
    const sessionId = req.query.session_id as string;
  
    if (!sessionId) {

        return res.status(400).send({ message: "Session ID not found" });
    }
  
    try {

      const paymentResult = await processPayment(sessionId);

      if (paymentResult.success)  {

        res.redirect(303, `${DOMAIN_ADDRESS}/success.html`);
      } else {
        return res.status(400).send({ message: paymentResult.message });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).send({ message: "Error processing payment" });
    }
  };