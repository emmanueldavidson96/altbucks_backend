import express from "express";
import { addBankDetailsController } from "../controllers/bankdetails.controller";
import { authenticate } from "../middleware/authenticate";

const bankDetailsRouter = express.Router();

//prefix : /api
bankDetailsRouter.post("/bank-details", authenticate, addBankDetailsController);

export default bankDetailsRouter;
