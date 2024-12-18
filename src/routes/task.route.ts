import { Router } from 'express';
import { getEarningsReport, addEarning } from '../controllers/task.controller';

const router = Router();

router.get('/:userId', getEarningsReport);
router.post('/', addEarning);

export default router;
