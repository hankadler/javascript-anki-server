import express from "express";
import { readUser, updateUser, deleteUser } from "../controllers/userController";
import deckRouter from "./deckRouter";
import restrictAccess from "../wares/restrictAccess";

const userRouter = express.Router({ mergeParams: true });

userRouter.route("/")
  .get(restrictAccess(), readUser)
  .delete(deleteUser);

userRouter.route("/:userId")
  .get(restrictAccess(), readUser)
  .patch(restrictAccess(), updateUser)
  .delete(restrictAccess(), deleteUser);

userRouter.use("/:userId/decks", restrictAccess(), deckRouter);

export default userRouter;
