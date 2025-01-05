import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import { CONFLICT, UNAUTHORISED } from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeTypes";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/VerificationCode.model";
import appAssert from "../utils/appAssert";
import { oneYearFromNow } from "../utils/date";
import jwt from "jsonwebtoken";
import { refreshTokenSignOptions, signToken } from "../utils/jwt";


export type CreateAccountParams = {
    email:string;
    password:string;
    userAgent?: string;
}

export const createAccount = async (data:CreateAccountParams) => {
    
    //verify existing user doesn't exist
    const existingUser = await UserModel.exists({
        email:data.email
    })
    // if(existingUser){
    //     throw new Error("User already exists")
    // }
    appAssert(!existingUser,CONFLICT, "Email already in use")

    // create user
    const user = await UserModel.create({
        email:data.email,
        password:data.password,
    })
    const userId = user._id;

    //create verification code
    const verificationCode = await VerificationCodeModel.create({
        userId,
        type:VerificationCodeType.EmailVerification,
        expiresAt:oneYearFromNow()
    })
    //send verification email
    
    //create session
    const session = await SessionModel.create({
        userId,
        userAgent:data.userAgent
    })

    //sign access token & refresh token
    const refreshToken = signToken(
        {
            sessionId:session._id
        },
        refreshTokenSignOptions
    )
    // access token 
    const accessToken = signToken(
        {
            userId,
            sessionId:session._id
        }
    )
    // return user
    return {
        user:user.omitPassword(),
        accessToken,
        refreshToken
    }
}

type LoginParams = {
    email:string;
    password: string;
    userAgent?:string;
}

export const loginUser = async ({email, password, userAgent}:LoginParams) => {
    //get the user by email
    const user = await UserModel.findOne({email});
    appAssert(user, UNAUTHORISED, "Invalid email or password")
    //validate password from the request
    const isValid = user.comparePassword(password)
    appAssert(isValid, UNAUTHORISED, "Invalid email or password");

    const userId = user._id;
    //create a session
    const session = await SessionModel.create({
        userId,
        userAgent,
    })

    const sessionInfo = {
        sessionId:session._id,
    }

    //sign access token & refresh token    
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions)

    // access token 
    const accessToken = signToken({
        ...sessionInfo,
        userId:user._id,
    })

    // return user & tokens
    return {
        user:user.omitPassword(),
        accessToken,
        refreshToken,
    }
}

export const refreshUserAccessToken = async (refreshToken: string) => {
    // Verify the refresh token
    const { payload } = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        payload: { sessionId: string }
    };

    // Get session
    const session = await SessionModel.findById(payload.sessionId);
    appAssert(session, UNAUTHORISED, "Invalid session");

    // Get user from session
    const user = await UserModel.findById(session.userId);
    appAssert(user, UNAUTHORISED, "User not found");

    // Create new tokens
    const newAccessToken = signToken({
        userId: user._id,
        sessionId: session._id
    });

    const newRefreshToken = signToken(
        { sessionId: session._id },
        refreshTokenSignOptions
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user.omitPassword()
    };
}
