import { request } from "http";
import { CREATED, OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import { emailSchema } from "./auth.schemas";

export const referralInviteHandler = catchErrors(
    async (request, response) => {
        //validate request
        const validatedData = emailSchema.parse(request.body.email);

        //call service
     
        //return response
        return response.status(CREATED).json({});
    }
)

export const referralLinkHandler = catchErrors(
    async (request, response) => {
        //call service
     
        //return response
        return response.status(OK).json({});
    }
)

export const getReferalsListHandler = catchErrors(
    async (request, response) => {
        //call service
     
        //return response
        return response.status(OK).json({});
    }
)

export const exportReferralsListHandler = catchErrors(
    async (request, response) => {
        // call service

        // return response
        return response.status(OK).json({})
    }
)