import catchErrors from "../utils/catchErrors";
import { createAccount, loginUser } from "../services/auth.service";
import { CREATED, OK, UNAUTHORISED } from "../constants/http";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";
import { AccessTokenPayload, verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";




export const registerHandler = catchErrors(
    async (request, response) => {
        //validate request
        const validatedData = registerSchema.parse({
            ...request.body,
            userAgent:request.headers["user-agent"],
        });

        //call service
        const {user, accessToken, refreshToken} = await createAccount(validatedData)
     
        //return response
        return setAuthCookies({response, accessToken, refreshToken})
        .status(CREATED)
        .json({user});
    }
)

export const loginHandler = catchErrors(async (request, response) => {
    const requested = loginSchema.parse({
        ...request.body,
        userAgent:request.headers["user-agent"]
    });
    const {accessToken, refreshToken} = await loginUser(requested)
    return setAuthCookies({response, accessToken, refreshToken}).status(OK).json({
        message:"Login successful"
    })
})

export const refreshHandler = catchErrors(async ( request, response) => {
    const refreshToken = request.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORISED, "Missing refresh token");
    
})

export const logoutHandler = catchErrors(async (request, response) => {
    const accessToken = request.cookies.accessToken;
    const {payload} = verifyToken<AccessTokenPayload>(accessToken || "")
    if(payload){
        await SessionModel.findByIdAndDelete(payload.sessionId);
    }
    return clearAuthCookies(response).
    status(OK).json({
        message:"Logout successful"
    })
})