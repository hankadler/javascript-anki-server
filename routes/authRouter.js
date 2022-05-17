import express from "express";
import { signUp, activate, signIn, signOut } from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/signUp", signUp);
authRouter.get("/activate/:token", activate);
authRouter.post("/signIn", signIn);
authRouter.delete("/signOut", signOut);

export default authRouter;
