import { Router } from 'express';
import { chargeCardController, BankTransferController, submitPinController, submitOtpController,submitAddressController } from '../controllers/flutterwave.controller';
import { authenticate } from "../middleware/authenticate"; 

const flutterwaveRoute = Router();

// //prefix : /api/flutterwave
flutterwaveRoute.post('/charge-card', chargeCardController);
flutterwaveRoute.post('/submit-pin', submitPinController);
flutterwaveRoute.post('/submit-otp', submitOtpController);
flutterwaveRoute.post('/submit-address', submitAddressController);
flutterwaveRoute.post('/banktransfer', BankTransferController);

export default flutterwaveRoute;