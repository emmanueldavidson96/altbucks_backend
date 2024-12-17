import { Request, Response } from "express";
import { getTaskEarnerWalletDetails, getTaskCreatorWalletDetails } from "../services/wallet.service";
import  mongoose  from "mongoose";

export const getWalletDetailsController = async (req: Request, res: Response) => {
    let userId = req.user?.userId; 
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
        
      }

      const userIdString = userId instanceof mongoose.Types.ObjectId ? userId.toString() : userId;

  try {
    const walletData = await getTaskEarnerWalletDetails(userIdString as string);

    if (!walletData) {
      res.status(404).json({ message: "Wallet not found for this user" });
      return;
    }

    res.status(200).json({
      availableBalance: walletData.availableBalance,
      totalEarned: walletData.totalBalanceEarned,
      totalWithdrawn: walletData.totalBalanceWithdrawn,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getTaskCreatorWalletDetailsController = async (req: Request, res: Response) => {
  let userId = req.user?.userId; 
  
  if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
      
    }

    const userIdString = userId instanceof mongoose.Types.ObjectId ? userId.toString() : userId;

try {
  const walletData = await getTaskCreatorWalletDetails(userIdString as string);

  if (!walletData) {
    res.status(404).json({ message: "Wallet not found for this user" });
    return;
  }

  res.status(200).json({
    availableBalance: walletData.availableBalance,
    totalEarned: walletData.totalBalanceDeposited,
    totalWithdrawn: walletData.totalTaskDeductions,
  });
} catch (error) {
  res.status(500).json({ message: "Server error. Please try again later." });
}
};
