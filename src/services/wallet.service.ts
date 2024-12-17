import walletModel from '../models/wallet.model';

const getWalletByUserId = async (userId: string) => {
  const wallet = await walletModel.findOne({ userId });
  if (!wallet) throw new Error('Wallet not found');
  return wallet;
};

export default { getWalletByUserId };
