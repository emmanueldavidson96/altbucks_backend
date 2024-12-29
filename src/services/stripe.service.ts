import Stripe from "stripe";
import { updateTaskCreatorWallet } from "./wallet.service";
const stripe = new Stripe("sk_test_51QVVHVRpLXhxt61JIPWMR2nIoKNQrU85z0ISWzYsUU7a4agUEpVhb9SnEoAGoXP4TbliyaJzmILSVfu3EE6AdLmh00fcWgXvVS", {
  apiVersion: '2024-11-20.acacia',
});




export const DOMAIN_ADDRESS = "http://localhost:4242";
const BACKEND_URL = "https://6b77-102-89-68-175.ngrok-free.app";


export const createStripeSession = async (amount: number, userId: string): Promise<Stripe.Checkout.Session | null> => {

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

    if (!session.metadata || !session.metadata.userId) {

      throw new Error("User ID not found in session metadata");
    }

    const userId = session.metadata.userId;

    if (session.payment_status === 'paid' && session.amount_total != null) {

      const amountPaid = session.amount_total / 100;

      await updateTaskCreatorWallet(userId, amountPaid);

      return { success: true, message: "Payment successful and wallet updated" };
    } else {
      throw new Error('Payment not completed or failed');
    }
  } catch (error: any) {
    console.error("Error processing payment: ", error);
    return { success: false, message: error.message };
  }
};

export const createStripeExpressAccount = async (email: string) => {
  try {
    const account = await stripe.accounts.create({
      country: 'US', // Adjust to your country code
      email: email,
      type: 'express', // Express account
      capabilities: {
        card_payments: { requested: true }, // Enable card payments
        transfers: { requested: true } // Enable payouts
      },
    });

    console.log('Express account created:', account.id);
    return account;
  } catch (error: any) {
    console.error('Error creating Express account:', error.message);
    throw error;
  }
};


export const createStripeAccountLink = async (accountId: string): Promise<string> => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://7017-102-89-83-221.ngrok-free.app/reauth', // Redirect URL for session refresh
      return_url: `https://6181-102-89-83-139.ngrok-free.app/onboarding-complete?accountId=${accountId}`, // Redirect URL after onboarding
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);
    return accountLink.url;
  } catch (error: any) {
    console.error('Error creating account link:', error.message);
    throw error;
  }
};

export const retrieveAccountDetails = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    console.log('Account details:', account);
    return account;
  } catch (error: any) {
    console.error('Error retrieving account details:', error.message);
    throw error;
  }
};

export const createTransferToConnectedAccount = async (accountId: string, amountInCents: number) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: accountId, // The connected account ID
    });

    console.log('Transfer created successfully:', transfer);
    return transfer;
  } catch (error: any) {
    console.error('Error creating transfer:', error.message);
    throw error;
  }
};

export const createPayoutToConnectedAccount = async (accountId: string, bankAccountId: string, amountInCents: number) => {
  try {
    const payout = await stripe.payouts.create(
      {
        amount: amountInCents,
        currency: 'usd',
        destination: bankAccountId, // Bank account ID of the connected account
      },
      {
        stripeAccount: accountId,
      }
    );

    console.log('Payout created successfully:', payout);
    return payout;
  } catch (error: any) {
    console.error('Error creating payout:', error.message);
    throw error;
  }
};



export const getBankAccountId = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    if (!account.external_accounts || !account.external_accounts.data) {
      throw new Error(
        'External accounts are not available for this account. Ensure the account is controlled and has appropriate permissions.'
      );
    }

    const bankAccountId = account.external_accounts.data.find(
      (account: any) => account.object === 'bank_account'
    )?.id;

    if (!bankAccountId) {
      throw new Error('No bank account found for the connected account.');
    }

    return bankAccountId;
  } catch (error: any) {
    console.error('Error retrieving bank account ID:', error.message);
    throw error;
  }
};








