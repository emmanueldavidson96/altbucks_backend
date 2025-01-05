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
import User from "./models/user.model";
import {body,validationResult} from "express-validator";
import { UserDocument } from "./models/user.model";

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

app.use("/auth", authRoutes)

//Error Handler Middleware
app.use(errorHandler);


// Helper functions
const generateQRCode = (username: string) => {
    return `${username}-${Math.random().toString(36).substring(7)}`;
};

  

app.post("/share", async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {

    // Validate userId format (if using `_id`)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
    
    // Cast userId to ObjectId
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    // Find user by _id
    const user = await User.findById(userIdObjectId);
  
    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return referral link on success
    return res.status(200).json({
      message: "Referral link shared successfully",
      link: `http://localhost:4004/register?ref=${user.qrCode}`,
    });
  } catch (error) {
    // Log and handle unexpected errors
    console.error("Error sharing referral link:", error);
    return res.status(500).json({ message: "Error sharing referral link", error });
  }
});


app.post("/referrals", async (req: Request, res: Response) => {
    try {
      const { referredBy, userId, referralLink, qrCode} = req.body;
      
  
      console.log("Received userId:", userId);
  
      // Input validation
      if (!referredBy || !userId || !qrCode || !referralLink) {
        return res.status(400).json({ message: "referredBy, userId, qrCode, and referralLink are required" });
      }
  
  
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
      }
  
  
      // Validate referredBy format
      if (!mongoose.Types.ObjectId.isValid(referredBy)) {
        return res.status(400).json({ message: "Invalid referredBy format" });
      }
      
      // Cast userId to ObjectId
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
  
  
      // Check if user exists
      const user = await User.findById(userIdObjectId);
      if (!user) {
        console.log("User not found with userId:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      
      // Cast referredBy to ObjectId
      const referredByObjectId = new mongoose.Types.ObjectId(referredBy);
  
      // Check if referrer exists
      const referrer = await User.findById(referredByObjectId);
      if (!referrer) {
        return res.status(404).json({ message: "Referrer not found" });
      }
  
      // Create a new referral
      const referral = new Referral({
        referredBy,
        userId,
        referralLink,
        qrCode,
      });
  
      // Save the referral
      await referral.save();
  
      // Update the user's reward points
      if (referredBy) {
        const referrer = await User.findOne({
          qrCode: referredBy
        });
        if (referrer) {
          // Increment rewardPoints and referralCount atomically
          await User.updateOne(
            { qrCode: referredBy },
            { $inc: {rewardPoints: 10, referralCount: 1 }}
          );
        }
      }
    
      await user.save();
  
      return res.status(201).json({ message: "Referral created successfully" });
    } catch (error) {
      console.error("Error creating referral:", error);
      return res.status(500).json({ message: "Error creating referral" });
    }
});

app.post("/generate-code", async (req: Request, res: Response) => {

    try {
      const { userId } = req.body;
  
      // userId received for debugging
      console.log("Received userId:", userId)
  
      // Validate userId format
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid userId format:", userId);
        return
        res.status(400).json({
          message: "Invalid userId format"
        });
      }
  
      
      // Cast userId to ObjectId
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
  
      
      // Query the user from the database
      const user = await User.findById(userIdObjectId);
      console.log("User query result:", user)
  
      // Handle user not found
      if (!user) {
        return
        res.status(404).json({
          message: "User not found"
        });
      }
  
      // Check if the user already has a referral code
      if (user?.qrCode) {
        return res.status(200).json({
          message: "QRcode already exists",
          qrCode: user?.qrCode,
        });
      }
  
      // Generate a new referral code if it doesn't exist
      const qrCode = generateQRCode(userId);
      user!.qrCode = qrCode;
  
      // Save the updated user object
       await user!.save();
  
      res.status(201).json({
        message: "Referral code generated successfully",
        qrCode,
      });
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ message: "Error generating QRcode", error });
    }
});



app.get("/api/referrals", async (req: Request, res: Response) => {
    try {
      const { search, sortBy, status, startDate, endDate } = req.query;
      
      console.log("Received query parameters:");
      console.log("search:", search);
      console.log("sortBy:", sortBy);
      console.log("status:", status);
      console.log("startDate:", startDate);
      console.log("endDate:", endDate);
    
      // Build the query filters
      const filters: any = {};
    
    
    if (search) {
        filters.referralLink = { $regex: search.toString(), $options: "i" }; // Case-insensitive regex search
    }
    
    
      if (status) {
        filters.status = status.toString(); // Example: 'active' or 'inactive'
      }
    
    
      if (startDate || endDate) {
        // Example: If you want to filter based on date range
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate.toString());
        if (endDate) filters.createdAt.$lte = new Date(endDate.toString());
      }
    
      console.log("Filters:");
      console.log(filters);
      // Sort the results based on query params
      const sort: any = {};
      if (sortBy) {
        sort[sortBy.toString()] = 1; // 1 for ascending, -1 for descending
      }
    
    
      // Query the database using the filters and sorting
      const referrals = await Referral.find(filters).sort(sort)
        .populate({
          path: "taskActivities", // Assumes a `taskActivities` field in the Referral schema
          select: "result status createdAt",
          options: { 
            sort: { createdAt: -1 }, // Sort task activities by most recent
            limit: 1, // Select only the most recent activity
          },
        }); 
    
      return res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return res.status(500).json({ message: "Failed to fetch referrals." });
    }
});
  
  
/**
* @route GET /referrals/:userId
* @description Track referrals
*/
app.get("/referrals/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
  
    try {
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ message: "User not found" });
      }
      
    const user = await User.findById(userId) as UserDocument | null;
  
    const referrals = await User.find({ referredBy: user?.qrCode});
    res.json({ referrals });
    } catch (error) {
         res.status(500).json({ message: "Error tracking referrals", error });
    }
});
  
  
/**
* @route GET /leaderboard
* @description Get top referrers leaderboard
*/
app.get("/leaderboard", async (req: Request, res: Response) => {
    try {
      const leaderboard = await User.find({}, "-password")
        .sort({ referralCount: -1 })
        .limit(10);
  
  
        res.json(leaderboard);
      } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error });
      }
  });
  
  
  /**
   * @route GET /rewards/:userId
   * @description Fetch reward points and breakdown
   */
app.get("/rewards/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
  
    try {
      // userId received for debugging
      console.log("Received userId:", userId)
  
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid userId format:", userId);
        return
        res.status(400).json({
          message: "Invalid userId format"
        });
      }
      
      // Query the user from the database
      const user = await User.findById(new mongoose.Types.ObjectId(userId));
      console.log("User query result:", user);
      
  
      // Handle user not found
      if (!user) {
        console.error("User not found for userId:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find referrals for the user
      const referrals = await User.find({ referredBy: user.qrCode });
      console.log("Referrals found:", referrals);
  
     // Build rewards breakdown
      const rewardsBreakdown = referrals.map((ref) => ({
        username: ref.username,
        email: ref.email,
        pointsEarned: 10, // Assuming 10 points per referral
      }));
      
     // Respond with rewards data
      res.json({
        totalRewardPoints: user.rewardPoints,
        rewardsBreakdown,
      });
      } catch (error) {
        res.status(500).json({ message: "Error fetching rewards", error });
      }
  });


app.listen(PORT, async () => {
    console.log(`App is running at port ${PORT} and in ${NODE_ENV} environment`)
    await connectToDatabase();
})