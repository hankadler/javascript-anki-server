import express from "express";
import { signUp, signIn, signOut } from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/signUp", signUp);
authRouter.post("/signIn", signIn);
authRouter.delete("/signOut", signOut);

export default authRouter;
