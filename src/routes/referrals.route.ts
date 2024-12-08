import { Router } from "express";
import { exportReferralsListHandler, getReferalsListHandler, referralInviteHandler, referralLinkHandler } from "../controllers/referrals.controller";

const referralRoutes = Router();

// To-do: Authentication middleware

//prefix : /referrals
referralRoutes.post("/invite", referralInviteHandler);
referralRoutes.get("/link", referralLinkHandler);
referralRoutes.get("/", getReferalsListHandler);
referralRoutes.get("/export", exportReferralsListHandler);


export default referralRoutes;