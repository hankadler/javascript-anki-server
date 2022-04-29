import { Deck } from "../models/Deck";
import { getOrDie, getUser } from "./helpers";

const createDeck = async (req, res) => {
  const user = await getUser(req);
  const { title, cards } = req.body;
  const deck = new Deck({ title, cards },);
  await user.pushDeck(deck);
  return res.status(200).json({ message: "pass", deck });
};

const readDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = req.params;
  if (deckId) {
    const deck = await user.decks.id(deckId);
    return res.status(200).json({ status: "pass", deck });
  }
  const { decks } = user;
  return res.status(200).json({ status: "pass", decks });
};

const updateDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = await getOrDie(req.params, "deckId");
  const { title, cards } = req.body;
  const deck = await user.updateDeck(deckId, { title, cards });
  return res.status(200).json({ status: "pass", deck });
};

const deleteDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = req.params;
  const response = await user.removeDeck(deckId);
  return res.status(200).json({ status: "pass", response });
};

export { createDeck, readDeck, updateDeck, deleteDeck };
