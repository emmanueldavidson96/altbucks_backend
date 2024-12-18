import Wallet from '../models/wallet.model';
import { startOfToday, endOfDay } from 'date-fns';

// Fetch Wallet Summary with Period Filter
export const getWalletSummary = async (userId: string, period: string) => {
  const filter: any = { userId };

  // Filter for today's wallet data
  if (period === 'today') {
    filter.createdAt = { $gte: startOfToday(), $lte: endOfDay(new Date()) };
  }

  const walletData = await Wallet.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        moneyAvailable: { $sum: '$moneyAvailable' },
        totalReceived: { $sum: '$totalReceived' },
        totalWithdrawn: { $sum: '$totalWithdrawn' },
      },
    },
  ]);

  return walletData.length > 0
    ? walletData[0]
    : { moneyAvailable: 0, totalReceived: 0, totalWithdrawn: 0 };
};
