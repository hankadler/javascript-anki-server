import User from "../models/User";
import FieldError from "../errors/FieldError";
import ValueError from "../errors/ValueError";

const getOrDie = async (obj, ...keys) => {
  const values = {};
  keys.forEach((key) => {
    const value = obj[key];
    if (value === undefined) {
      throw new FieldError(`Missing {${key}}!`);
    }
    values[key] = value;
  });
  return values;
};

const getUser = async (req) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new ValueError("Bad {userId}!");
  return user;
};

const getDeck = async (req) => {
  const { userId, deckId } = req.params;
  const user = await User.findById(userId);
  const deck = await user.decks.id(deckId);
  if (!deck) throw new ValueError("Bad {deckId}!");
  return deck;
};

export { getOrDie, getUser, getDeck };
