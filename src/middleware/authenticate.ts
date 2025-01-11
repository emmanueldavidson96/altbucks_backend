import { Request, Response, NextFunction } from "express";  
import { AccessTokenPayload, verifyToken } from "../utils/jwt";
import { UNAUTHORISED, FORBIDDEN } from "../constants/http";
import jwt from 'jsonwebtoken';


declare global {
    namespace Express {
        interface Request {
            user?: { userId: string; email: string }; // Modify this type to match your decoded token's structure
        }
    }
}
const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate = (req: Request, res: Response, next: NextFunction)  => {
    
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(UNAUTHORISED).json({ message: 'Authorization header missing' });
    }


    const token = authHeader.split(' ')[1];  
    if (!token) {
        return res.status(UNAUTHORISED).json({ message: 'Token missing' });
    }

    try {
       
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; roles: string[] }; 

       
        req.user = decoded;

       
        next();
    } catch (error) {
        console.log(error);
        return res.status(FORBIDDEN).json({ message: 'Invalid or expired token' });
    }
};