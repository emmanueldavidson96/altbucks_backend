import { Request, Response, NextFunction } from 'express';
import { getWalletSummary } from '../services/wallet.service';

// Controller for Wallet Summary
export const fetchWalletSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params; // User ID passed as a URL param
    const { period } = req.query; // Query param: 'today' or 'all'

    // Default to 'all' if no period is provided
    const walletData = await getWalletSummary(
      userId,
      (period as string) || 'all'
    );

    res.status(200).json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    next(error);
  }
};
