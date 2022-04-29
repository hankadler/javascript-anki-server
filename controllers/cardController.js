import { Card } from "../models/Card";
import { getOrDie, getDeck } from "./helpers";

const createCard = async (req, res) => {
  const deck = await getDeck(req);
  const { question, answer } = await getOrDie(req.body, "question", "answer");
  const card = new Card({ question, answer });
  await deck.pushCard(card);
  return res.status(201).json({ status: "pass", card });
};

const readCard = async (req, res) => {
  const deck = await getDeck(req);
  const { cardId } = req.params;
  if (cardId) {
    const card = await deck.cards.id(cardId);
    return res.status(200).json({ status: "pass", card });
  }
  const { cards } = deck;
  return res.status(200).json({ status: "pass", cards });
};

const updateCard = async (req, res) => {
  const deck = await getDeck(req);
  const { cardId } = await getOrDie(req.params, "cardId");
  const { question, answer } = req.body;
  const card = await deck.updateCard(cardId, { question, answer });
  return res.status(200).json({ status: "pass", card });
};

const deleteCard = async (req, res) => {
  const deck = await getDeck(req);
  const { cardId } = req.params;
  const response = await deck.removeCard(cardId);
  return res.status(200).json({ status: "pass", response });
};

export { createCard, readCard, updateCard, deleteCard };
