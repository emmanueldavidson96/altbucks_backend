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
import paypalRouter from "./routes/paypal.route";
import flutterwaveRoute from "./routes/flutterwave.route";
import stripeRouter from "./routes/stripe.route";
import webhookRoutes from "./routes/flutterwavewebhook.route";

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

app.use("/auth", authRoutes)
app.use("/api/paypal", paypalRouter); 
app.use("/api/flutterwave", flutterwaveRoute);
app.use("/api/stripe", stripeRouter);

app.use("/api", webhookRoutes);


//Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`App is running at port ${PORT} and in ${NODE_ENV} environment`)
    await connectToDatabase();
})