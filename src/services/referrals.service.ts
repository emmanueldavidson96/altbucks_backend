import ReferralModel from "../models/referrals.model";

export const sendReferralInvite = async (email:string, userId:string) => {
    // create new Referral model
    const referral = await ReferralModel.create({
        email,
        senderId: userId,
        sentAt: new Date(),
        status: "pending",
    });
    // add invite for specified email to queue

    // return response
    return referral

}

export const getInviteLink = async (userId: string) => {
    // To-do create generateInviteLink function
    const inviteLink = generateInviteLink(userId);
    return { inviteLink };
};

export const getReferralsList = async (userId: string, filters: any) => {
    const { status, date, page = 1, limit = 10 } = filters;

    const query: any = { senderId: userId };
    if (status) query.status = status;
    if (date) query.sentAt = { $gte: new Date(date) };

    const referrals = await ReferralModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ sentAt: -1 });

    const totalCount = await ReferralModel.countDocuments(query);

    return {
        data: referrals,
        pagination: {
            page,
            limit,
            totalCount,
        },
    };
};

export const exportReferralsList = async (userId: string) => {
    const referrals = await ReferralModel.find({ senderId: userId }).sort({ sentAt: -1 });

    const csvHeaders = "Email,Status,Sent At,Accepted At\n";
    const csvRows = referrals
        .map(
            (referral) =>
                `${referral.email},${referral.status},${referral.sentAt.toISOString()},${referral.acceptedAt?.toISOString() || ""}`
        )
        .join("\n");

    const csvContent = csvHeaders + csvRows;
    return csvContent;
}