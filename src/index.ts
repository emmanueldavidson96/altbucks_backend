// index.ts
import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import { OK } from "./constants/http";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import taskRoutes from "./routes/task.route";
import applicationRoutes from "./routes/application.routes";  // Add this import

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: APP_ORIGIN,
        credentials: true,
    })
);
app.use(cookieParser());

// Routes
app.get("/", (request: Request, response: Response, next: NextFunction) => {
    return response.status(OK).json({ message: "Server works fine" });
});

app.use("/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/applications", applicationRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`App is running at port ${PORT} and in ${NODE_ENV} environment`);
    await connectToDatabase();
});