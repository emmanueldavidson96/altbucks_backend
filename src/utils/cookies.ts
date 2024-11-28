import { CookieOptions, Response } from "express"
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.NODE_ENV !== "development"
export const REFRESH_PATH = "/auth/refresh";

const defaults:CookieOptions = {
    sameSite:"strict",
    httpOnly:true,
    secure:true
}

type Params = { 
    response:Response,
    accessToken:string,
    refreshToken:string;
}

const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires:thirtyDaysFromNow(),
    path:REFRESH_PATH
})


const getAccessTokenCookieOptions = ():CookieOptions => ({
    ...defaults,
    expires:fifteenMinutesFromNow()
})

export const setAuthCookies = ({response, accessToken, refreshToken}:Params ) => {
    response.cookie("accessToken", accessToken).cookie("refreshToken", refreshToken)
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
    return response;
}

export const clearAuthCookies = (response:Response) => {
    response.clearCookie("accessToken").clearCookie("refreshToken", {
        path:REFRESH_PATH,
    })
    return response;
}