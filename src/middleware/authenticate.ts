import { Request, Response, NextFunction } from "express";  
import { AccessTokenPayload, verifyToken } from "../utils/jwt";
import { UNAUTHORISED } from "../constants/http";



declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;  // Attach the AccessTokenPayload type to user
        }
    }
}

// Authentication middleware to verify the JWT token
export const authenticate =  (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies.accessToken;

    if (!token) {
        return response.status(UNAUTHORISED).json({ message: "Please Login" });
    }
    const { payload, error } = verifyToken<AccessTokenPayload>(token);

    if (error) {
        return response.status(401).json({ message: "Invalid or expired token" });  // Token is invalid or expired
    }

    request.user = payload;  // Attach the user payload to the request object (for access in the next middleware)
    next();
}
