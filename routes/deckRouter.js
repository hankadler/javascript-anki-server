import express from "express";
import { createDeck, readDeck, updateDeck, deleteDeck } from "../controllers/deckController";
import cardRouter from "./cardRouter";

const deckRouter = express.Router({ mergeParams: true });

deckRouter.route("/")
  .post(createDeck)
  .get(readDeck)
  .delete(deleteDeck);

deckRouter.route("/:deckId")
  .get(readDeck)
  .patch(updateDeck)
  .delete(deleteDeck);

deckRouter.use("/:deckId/cards", cardRouter);

export default deckRouter;
