import _ from "lodash";
import { Deck } from "../models/Deck";
import { getOrDie, getUser, parseQuery, paginate, sortDocs, selectFields } from "./helpers";

const createDeck = async (req, res) => {
  const user = await getUser(req);
  const { image, title, cards } = req.body;
  const deck = new Deck({ image, title, cards });
  await user.pushDeck(deck);
  return res.status(200).json({ status: "pass", deck });
};

const readDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = req.params;
  const { queryOpts, queryParams } = await parseQuery(req);
  if (!_.isEmpty(queryOpts) || !_.isEmpty(queryParams)) {
    let decks = !_.isEmpty(queryParams) ? await user.searchDecks(queryParams) : await user.decks;
    decks = await selectFields(decks, queryOpts);
    decks = await paginate(decks, queryOpts);
    decks = await sortDocs(decks, queryOpts);
    return res.status(200).json({ status: "pass", count: decks.length, decks });
  }
  if (deckId) {
    const deck = await user.decks.id(deckId);
    return res.status(200).json({ status: "pass", deck });
  }
  const { decks } = user;
  return res.status(200).json({ status: "pass", count: decks.length, decks });
};

const updateDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = await getOrDie(req.params, "deckId");
  const { image, title, cards } = req.body;
  const deck = await user.updateDeck(deckId, { image, title, cards });
  return res.status(200).json({ status: "pass", deck });
};

const deleteDeck = async (req, res) => {
  const user = await getUser(req);
  const { deckId } = req.params;
  const response = await user.removeDeck(deckId);
  return res.status(200).json({ status: "pass", response });
};

export { createDeck, readDeck, updateDeck, deleteDeck };
