import express, { Router, Response } from "express";
import { loginHandler, logoutHandler, registerHandler,refreshHandler } from "../controllers/auth.controller";




const authRoutes = Router();
const app = express();
app.use(express.json());

//prefix : /auth
authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh", refreshHandler )
authRoutes.get("/logout", logoutHandler);


export default authRoutes;






