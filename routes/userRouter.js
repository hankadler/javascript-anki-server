import express from "express";
import { readUser, updateUser, deleteUser } from "../controllers/userController";
import deckRouter from "./deckRouter";

const userRouter = express.Router({ mergeParams: true });

userRouter.route("/")
  .get(readUser)
  .delete(deleteUser);

userRouter.route("/:userId")
  .get(readUser)
  .patch(updateUser)
  .delete(deleteUser);

userRouter.use("/:userId/decks", deckRouter);

export default userRouter;
