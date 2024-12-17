import { Router } from 'express';
import { getWalletSummary } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/summary', authMiddleware, getWalletSummary);

export default router;
