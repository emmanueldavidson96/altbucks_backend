import TaskEarnerWallet, { Wallet} from "../models/task-earner-wallet.model";
import TaskCreatorWallet from "../models/task-creator-wallet";
import { ITaskCreatorWallet} from "../models/task-creator-wallet";
import TransactionLogModel from '../models/TransactionLog';

export const getTaskEarnerWalletDetails = async (userId: string) => {
  try {
    const wallet = await TaskEarnerWallet.findOne({ user: userId }).exec();

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


export const getTaskCreatorWalletDetails = async (userId: string) => {
  try {
    const wallet = await TaskCreatorWallet.findOne({ user: userId }).exec();

    if (!wallet) {
      return null;
    }

    return {
      availableBalance: wallet.availableBalance,
      totalBalanceDeposited: wallet.totalBalanceDeposited,
      totalTaskDeductions: wallet.totalTaskDeductions,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching wallet details");
  }
};

export const updateTaskCreatorWallet = async (userId: string, amount: number) => {
  try {
    const wallet = await TaskCreatorWallet.findOne({ user: userId });

    if (!wallet) {
      throw new Error("Task creator wallet not found.");
    }

    wallet.availableBalance += amount;
    wallet.totalBalanceDeposited += amount;

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

export const updateTaskEarnerWallet = async (userId: string, amount: number): Promise<Wallet> => {
  const wallet = await TaskEarnerWallet.findOne({ userId });

  if (!wallet) {
    throw new Error("Task earner wallet not found.");
  }

  wallet.availableBalance -= amount; 
  wallet.totalBalanceWithdrawn += amount;

  await wallet.save();

  return wallet.toObject();
};



