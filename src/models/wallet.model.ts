import mongoose, { Schema, Document } from 'mongoose';


export interface IWallet extends Document {
  availableBalance: number; 
  totalBalanceEarned: number; 
  totalBalanceWithdrawn: number;
}

const WalletSchema: Schema = new Schema(
  {
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBalanceEarned: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBalanceWithdrawn: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true } 
);


const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
