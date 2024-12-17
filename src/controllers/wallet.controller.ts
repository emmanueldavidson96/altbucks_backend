import { Request, Response } from 'express';
import WalletService from '../services/wallet.service';

export const getWalletSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const wallet = await WalletService.getWalletByUserId(userId);
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
