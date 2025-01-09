import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import catchErrors from "./utils/catchErrors";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import mongoose from "mongoose";
import dotenv from "dotenv";
import qrCode from "qrcode";
import Referral from "./models/referral.model";
import {body,validationResult} from "express-validator";
import  User, {UserDocument} from "./models/user.model";
import router from "./routes/referral.route";

//Application Middlewares
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
    cors({
        origin:APP_ORIGIN,
        credentials:true,
    })
)
app.use(cookieParser())


dotenv.config();

const MONGOURL = process.env.MONGO_URL;


//Application Routes
app.get("/", (request:Request, response:Response, next:NextFunction)=> {
    return response.status(OK).json({message:"Server works fine"})
})
    // catchErrors(async (request:Request, response:Response, next:NextFunction) => {
    // throw new Error("This is a test error");
    // return response.status(200).json({
    //     status:"healthy"
    // })
    // try{
    //     throw new Error("This is a test error");
    //     return response.status(201).json("Server running fine.")
    // }catch(error){
    //     next(error)
    // }

app.use("/auth", authRoutes);
app.use("/api/referrals", router);

//Error Handler Middleware
app.use(errorHandler);


app.listen(PORT, async () => {
    console.log(`App is running at port ${PORT} and in ${NODE_ENV} environment`)
    await connectToDatabase();
})