import { request } from "http";
import { CREATED, OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import { emailSchema } from "./auth.schemas";
import {
    exportReferralsList,
    getInviteLink,
    getReferralsList,
    sendReferralInvite
} from "../services/referrals.service";

export const referralInviteHandler = catchErrors(
    async (request, response) => {
        //validate request
        const validatedEmail = emailSchema.parse(request.body.email);

        // The userId will be added by the authentication middleware
        const { userId } = request.body;

        //call service
        const referral = await sendReferralInvite(validatedEmail, userId);
     
        //return response
        return response.status(CREATED).json({ referral });
    }
)

export const referralLinkHandler = catchErrors(
    async (request, response) => {
        const { userId } = request.body;

        const inviteLink = await getInviteLink(userId);

        return response.status(OK).json({ inviteLink });
    }
)

export const getReferalsListHandler = catchErrors(
    async (request, response) => {
        const { userId } = request.body;
        const filters = {
            status: request.query.status,
            date: request.query.date,
            page: parseInt(request.query.page as string, 10) || 1,
            limit: parseInt(request.query.limit as string, 10) || 10,
        };

        const referralsList = await getReferralsList(userId, filters);

        return response.status(OK).json(referralsList);
        }
)

export const exportReferralsListHandler = catchErrors(
    async (request, response) => {
        const { userId } = request.body;

        const csvContent = await exportReferralsList(userId);

        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=referrals.csv");
        return response.status(OK).send(csvContent);
    }
)