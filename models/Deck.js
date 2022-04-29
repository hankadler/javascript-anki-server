import mongoose from "mongoose";
import { cardSchema } from "./Card";

const deckSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: 140
  },
  cards: {
    type: [cardSchema],
    default: [],
    validate: [
      (cards) => {
        const questions = cards.map((card) => card.question);
        return (new Set(questions)).size === questions.length;
      },
      "Duplicate card question!"
    ]
  }
}, {
  autoCreate: false,
  autoIndex: false
});

deckSchema.methods.pushCard = async function (card) {
  await this.cards.push(card);
  return this.parent().save();
};

deckSchema.methods.removeCard = async function (cardId) {
  let acknowledged = false;
  let deletedCount = 0;
  if (cardId) {
    await this.cards.id(cardId).remove();
    acknowledged = true;
    deletedCount = 1;
  } else {
    const count = this.cards.length;
    this.cards = [];
    acknowledged = true;
    deletedCount = count;
  }
  this.parent().save();
  return { acknowledged, deletedCount };
};

deckSchema.methods.updateCard = async function (cardId, { question, answer }) {
  const card = await this.cards.id(cardId);
  if (question) card.question = question;
  if (answer) card.answer = answer;
  return this.parent().save();
};

const Deck = mongoose.model("Deck", deckSchema);

export { Deck, deckSchema };
