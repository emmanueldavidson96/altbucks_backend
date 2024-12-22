import { Request, Response } from "express";
import { createStripeSession, processPayment } from "../services/stripe.service";
import { DOMAIN_ADDRESS, createStripeExpressAccount, createStripeAccountLink, retrieveAccountDetails, createTransferToConnectedAccount, getBankAccountId, createPayoutToConnectedAccount } from "../services/stripe.service";



export const createStripeCheckoutSession = async (req: Request, res: Response) => {
  const { amount } = req.body;
  let userId = req.user?.userId as string;

  const numericAmount = Number(amount);

  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).send("Invalid amount. Please provide a positive value.");

  }

  if (!userId) {
    return res.status(400).send("User not authenticated.");
  }

  try {
    const stripeSession = await createStripeSession(numericAmount, userId);

    if (!stripeSession || !stripeSession.url) {

      return res.status(500).send("Something went wrong while creating the session.");
    }


    const sessionUrl = stripeSession.url;
    console.log(sessionUrl);

    res.redirect(303, sessionUrl);

  } catch (error: any) {
    console.error(error.message);
    res.status(500).send(error.message || "Something went wrong while creating the session.")
  }
};

export const confirmPaymentSuccessController = async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {

    return res.status(400).send({ message: "Session ID not found" });
  }

  try {

    const paymentResult = await processPayment(sessionId);

    if (paymentResult.success) {

      res.redirect(303, `${DOMAIN_ADDRESS}/success.html`);
    } else {
      return res.status(400).send({ message: paymentResult.message });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).send({ message: "Error processing payment" });
  }
};

export const stripeOnboardingController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to create a Stripe account.' });
    }

    const account = await createStripeExpressAccount(email);
    console.log(account.id);

    // const user = await User.findOneAndUpdate(
    //     { email },
    //     { stripeAccountId: account.id },
    //     { new: true }
    // );

    // if (!user) {
    //     return res.status(404).json({ message: 'User not found with the provided email.' });
    // }

    // console.log('Stripe Account ID saved to database.');

    const accountLinkUrl = await createStripeAccountLink(account.id);
    res.redirect(303, accountLinkUrl);
  } catch (error: any) {
    console.error('Error creating Express account:', error.message);
    res.status(500).send('Error creating Stripe account. Please try again.');
  }
};


export const handleReturnUrl = async (req: Request, res: Response) => {

  try {
    const accountId = req.query.accountId as string;

    if (!accountId) {
      return res.status(400).json({ message: 'Missing account ID in return URL.' });
    }

    const account = await retrieveAccountDetails(accountId);

    if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
      return res.json({ message: 'Your account is now active and ready to accept payments.' });
    }

    const accountLinkUrl = await createStripeAccountLink(accountId);
    console.log(`Account restricted. Redirecting for further onboarding. Account ID: ${accountId}`);
    return res.redirect(accountLinkUrl);
  } catch (error: any) {
    console.error('Error processing account:', error.message);
    res.status(500).json({ message: 'An error occurred while checking account status. Please try again later.' });
  }
};


export const handleCreateTransfer = async (req: Request, res: Response) => {

  const { accountId, amountInCents } = req.query;

  if (!accountId || !amountInCents) {
    return res.status(400).json({ error: 'accountId and amountInCents are required.' });
  }

  const parsedAmount = Math.round(parseFloat(amountInCents as string) * 100);

  try {
    const transfer = await createTransferToConnectedAccount(accountId as string, parsedAmount);
    res.status(200).json(transfer);
  } catch (error: any) {
    console.error('Failed to create transfer:', error.message);
    res.status(500).json({ error: 'Failed to create transfer', message: error.message });
  }
};


export const handleCreatePayout = async (req: Request, res: Response) => {
  const { accountId, amount } = req.body;

  if (!accountId) {
    return res.status(400).json({ message: 'Account ID is required.' });
  }

  const amountInCents = Math.round(parseFloat(amount) * 100);

  if (isNaN(amountInCents) || amountInCents <= 0) {
    return res.status(400).json({ message: 'Invalid amount format or value.' });
  }

  try {
    const bankAccountId = await getBankAccountId(accountId);

    const payout = await createPayoutToConnectedAccount(accountId, bankAccountId, amountInCents);

    res.status(200).json({ success: true, payout });

  } catch (error: any) {
    console.error('Error processing payout:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

