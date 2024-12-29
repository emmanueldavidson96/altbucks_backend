import { Router } from 'express';
import { chargeCardController, submitPinController, submitOtpController } from '../controllers/flutterwave.controller'; // Adjust the import path

const router = Router();

// //prefix : /api/flutterwave
router.post('/charge-card', chargeCardController);
router.post('/submit-pin', submitPinController);
router.post('/submit-otp', submitOtpController);

export default router;