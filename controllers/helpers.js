import _ from "lodash";
import { createTransport } from "nodemailer";
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

const hasQuery = (req) => Object.keys(req.query).length;

const parseQuery = async (req) => {
  if (!hasQuery(req)) return {};
  const queryOpts = {};
  const queryParams = {};
  const operKeys = ["limit", "select", "sort", "skip", "where", "lt", "lte", "equals", "gte", "gt"];
  Object.keys(req.query).forEach((k) => {
    if (operKeys.includes(k)) {
      queryOpts[k] = req.query[k];
    } else {
      queryParams[k] = req.query[k];
    }
  });
  return { queryOpts, queryParams };
};

const paginate = async (arr, queryOpts) => {
  if (!queryOpts) return arr;
  const skip = queryOpts.skip ? queryOpts.skip : 0;
  const limit = queryOpts.limit ? queryOpts.limit : 0;
  return arr.slice(skip, limit ? skip + limit : undefined);
};

/**
 * Parses query parameter objects.
 *
 * Example:
 *     "field1.value1,field2.value2" -> { field1: "value1", field2: "value2" }
 *
 * @param value
 * @returns {Promise<void>}
 */
const parseParamObj = async (value) => {
  const result = {};
  const dotPairs = value.split(",");
  dotPairs.forEach((dotPair) => {
    const [k, v] = dotPair.split(".");
    result[k] = v;
  });
  return result;
};

/**
 * Sorts document arrays.
 *
 * @param  {Array} arr
 * @param {Object} queryOpts
 * @returns {Array}
 */
const sortDocs = async (arr, queryOpts) => {
  if (!queryOpts) return arr;
  const { sort } = queryOpts;
  if (!sort) return arr;
  const result = [...arr];
  const sortOpts = await parseParamObj(sort);
  const ascending = ["ascending", "asc", "1"];
  const descending = ["descending", "desc", "-1"];
  Object.entries(sortOpts).forEach(([key, sortOpt]) => {
    if (ascending.includes(sortOpt)) {
      result.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      });
    }
    if (descending.includes(sortOpt)) {
      result.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      });
    }
  });
  return result;
};

/**
 * Returns only the queryOpts.select properties from arr.
 *
 * Example:
 *   Input
 *     - arr = [{ id: 1, name: "Foo", age: 25 }, { id: 2, name: "Bar", age: 35 }]
 *     - queryOpts = { select: "name,age" }
 *   Output
 *     - [{ name: "Foo", age: 25 }, { name: "Bar", age: 35 }]
 *
 * @param {Array} arr
 * @param {Object} queryOpts
 * @returns {Promise<*>}
 */
const selectFields = async (arr, queryOpts) => {
  const { select } = queryOpts;
  if (!select) return arr;
  const fields = select.split(",");
  return arr.map((obj) => _.pick(obj, fields));
};

const sendEmail = async (to, subject, message, isPlain = false) => {
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `<${process.env.EMAIL_USER}>`,
    replyTo: `noreply@${process.env.EMAIL_USER.split("@").slice(-1)}`,
    to,
    subject,
  };

  if (isPlain) {
    mailOptions.text = message;
  } else {
    mailOptions.html = message;
  }

  return transporter.sendMail(mailOptions);
};

export { getOrDie, getUser, getDeck, parseQuery, paginate, sortDocs, selectFields, sendEmail };
