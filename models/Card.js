import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxLength: 280
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxLength: 280
  }
}, {
  autoCreate: false,
  autoIndex: false
});

const Card = mongoose.model("Card", cardSchema);

export { Card, cardSchema };
