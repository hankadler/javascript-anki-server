import express from "express";
import { createCard, readCard, updateCard, deleteCard } from "../controllers/cardController";

const cardRouter = express.Router({ mergeParams: true });

cardRouter.route("/")
  .post(createCard)
  .get(readCard)
  .delete(deleteCard);

cardRouter.route("/:cardId")
  .get(readCard)
  .patch(updateCard)
  .delete(deleteCard);

export default cardRouter;
