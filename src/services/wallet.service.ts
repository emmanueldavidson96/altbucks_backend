import Wallet  from "../models/wallet.model";


import TransactionLogModel from '../models/TransactionLog';

export const getWalletDetails = async (userId: string) => {
  try {
    const wallet = await Wallet.findOne({ user: userId }).exec();

    if (!wallet) {
      return null;
    }

    return {
      availableBalance: wallet.availableBalance,
      totalBalanceEarned: wallet.totalBalanceEarned,
      totalBalanceWithdrawn: wallet.totalBalanceWithdrawn,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching wallet details");
  }
};


export const updateWallet = async (userId: string, amount: number) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      throw new Error("Task creator wallet not found.");
    }

    wallet.availableBalance += amount;
    wallet. totalBalanceWithdrawn+= amount;

    await wallet.save();

    const transactionLog = new TransactionLogModel({
      wallet: wallet._id,
      amount: amount,
      transactionType: 'credit',
      transactionDate: new Date(),
      description: `Credit of ${amount} from Stripe payment`,
    });

    await transactionLog.save();

    console.log("Wallet updated and transaction logged successfully");

    return wallet.toObject();
  } catch (error) {
    console.error("Error updating wallet: ", error);
    throw new Error("Error updating wallet and logging transaction");
  }
};




