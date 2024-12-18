import { Router } from 'express';
import { fetchWalletSummary } from '../controllers/wallet.controller';

const router = Router();

router.get('/:userId', fetchWalletSummary);

export default router;
