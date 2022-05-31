import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import restrictAccess from "./wares/restrictAccess";
import handleError from "./wares/handleError";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";

const app = express();
const nodeEnv = process.env.NODE_ENV || "dev";

/* wares */
if (nodeEnv === "dev") app.use(morgan("dev"));
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

/* routes */
app.use(express.static("../client/dist"));
app.get("/anki/v1", (req, res) => res.status(200).json({ status: "pass", message: "Welcome!" }));
app.use("/anki/v1", authRouter);
app.use(restrictAccess());
app.use("/anki/v1/users", userRouter);
app.use(handleError(nodeEnv));

export default app;
