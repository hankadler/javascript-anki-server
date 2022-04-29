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
  }
});

userSchema.virtual("passwordAgain");

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) await this.updatePassword(this.password, this.passwordAgain);
  return next();
});

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

userSchema.methods.getToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
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

userSchema.methods.updateDeck = async function (deckId, { title, cards }) {
  const deck = await this.decks.id(deckId);
  if (title) deck.title = title;
  if (cards) deck.cards = cards;
  return this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
