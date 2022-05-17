import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { deckSchema } from "./Deck";
import AuthError from "../errors/AuthError";
import FieldError from "../errors/FieldError";
import ValueError from "../errors/ValueError";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid email!"],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 12,
    select: false
  },
  passwordModifiedAt: {
    type: String,
    default: Math.floor(Date.now() / 1000).toString(),
    select: false
  },
  decks: {
    type: [deckSchema],
    default: [],
    validate: [
      (decks) => {
        const titles = decks.map((deck) => deck.title);
        return (new Set(titles)).size === titles.length;
      },
      "Duplicate deck title!"
    ]
  },
  activated: {
    type: Boolean,
    default: false,
  }
});

userSchema.virtual("passwordAgain");

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) await this.updatePassword(this.password, this.passwordAgain);
  return next();
});

userSchema.statics.fromToken = async function (token) {
  // is token signature correct?
  const payload = await jwt.verify(token, process.env.JWT_SECRET);
  if (!payload) throw new AuthError("Invalid token signature!");
  // get user from payload id
  const user = await this.findById(payload.id);
  if (!user) throw new AuthError("Invalid token payload!");
  return user;
};

userSchema.statics.isAuth = async function (token) {
  // is token signature correct?
  const payload = await jwt.verify(token, process.env.JWT_SECRET);
  if (!payload) throw new AuthError("Invalid token signature!");
  // get user from payload id
  const user = await this.findById(payload.id).select("+passwordModifiedAt");
  if (!user) throw new AuthError("Invalid token payload!");
  // is token newer than password?
  const tokenIssuedAt = new Date(parseInt(payload.iat, 10) * 1000);
  const passwordModifiedAt = new Date(parseInt(user.passwordModifiedAt, 10) * 1000);
  const isTokenUpToDate = tokenIssuedAt.getTime() > passwordModifiedAt.getTime();
  if (!isTokenUpToDate) throw new AuthError("Token expired!");
  return true;
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.updatePassword = async function (password, passwordAgain) {
  if (!password) throw new FieldError("Missing {password}!");
  if (!passwordAgain) throw new FieldError("Missing {passwordAgain}!");
  if (password !== passwordAgain) throw new ValueError("Passwords don't match!");
  this.password = await bcrypt.hash(password, 12);
  this.passwordModifiedAt = Math.floor(Date.now() / 1000).toString();
};

userSchema.methods.getToken = async function (expiresIn = process.env.JWT_EXPIRES_IN) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn });
};

userSchema.methods.pushDeck = async function (deck) {
  await this.decks.push(deck);
  return this.save();
};

userSchema.methods.removeDeck = async function (deckId) {
  let acknowledged = false;
  let deletedCount = 0;
  if (deckId) {
    await this.decks.id(deckId).remove();
    acknowledged = true;
    deletedCount = 1;
  } else {
    const count = this.decks.length;
    this.decks = [];
    acknowledged = true;
    deletedCount = count;
  }
  this.save();
  return { acknowledged, deletedCount };
};

userSchema.methods.updateDeck = async function (deckId, { image, title, cards }) {
  const deck = await this.decks.id(deckId);
  if (image !== undefined) deck.image = image;
  if (title) deck.title = title;
  if (cards) deck.cards = cards;
  this.save();
  return deck;
};

userSchema.methods.searchDecks = async function (query) {
  const result = new Set([]);
  Object.entries(query).forEach(([k, v]) => {
    // make matching case insensitive
    const key = k.toLowerCase();
    const value = v.toLowerCase();
    // search decks or cards?
    if (key === "title") {
      // decks
      const decks = this.decks.filter((deck) => deck[key].toLowerCase().match(value));
      if (decks.length) result.add(...decks);
    } else {
      // cards
      this.decks.forEach((deck) => {
        const subQuery = {};
        subQuery[k] = v;
        const cards = deck.searchCards(subQuery); // don't make searchCards async!
        if (cards.length) result.add(deck);
      });
    }
  });
  return [...result];
};

const User = mongoose.model("User", userSchema);

export default User;
