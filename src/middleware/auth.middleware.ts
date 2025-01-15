import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { verifyToken, AccessTokenPayload } from "../utils/jwt";
import appAssert from "../utils/appAssert";
import { UNAUTHORISED } from "../constants/http";

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    appAssert(authHeader, UNAUTHORISED, "Authorization header is required");

    const token = authHeader.split(" ")[1];
    appAssert(token, UNAUTHORISED, "Access token is required");

    const { payload, error } = verifyToken<AccessTokenPayload>(token);
    appAssert(!error && payload, UNAUTHORISED, "Invalid access token");

    const typedPayload = payload as AccessTokenPayload;
    appAssert(typedPayload.userId, UNAUTHORISED, "Invalid token payload");

    // Attach the userId to the request object
    req.user = { id: new Types.ObjectId(typedPayload.userId.toString()) };

    next();
  } catch (error) {
    next(error);
  }
};
