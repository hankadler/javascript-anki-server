import mongoose from "mongoose";

mongoose.set("runValidators", true);
mongoose.set("returnOriginal", false);

/**
 * Connects to mongoDB.
 *
 * @param {string} uri - A mongoDB connection string.
 * @returns {Promise} - A connection object.
 */
const connect = async (uri) => {
  const conn = await mongoose.connect(uri);
  const { host: dbHost, port: dbPort, name: dbName } = conn.connections[0];
  console.log("Connected to database:");
  console.log("    host:", dbHost);
  console.log("    port:", dbPort);
  console.log("    name:", dbName);
  return conn;
};

/**
 * Disconnects from mongoDB.
 *
 * @param {Function} callback - Callback to execute on disconnect.
 * @returns {void}
 */
const disconnect = (callback = undefined) => mongoose.disconnect(callback);

/**
 * Drops active mongoDB.
 *
 * @param {Function} callback - Callback to execute on drop.
 * @returns {void}
 */
const drop = (callback = undefined) => mongoose.connection.db.dropDatabase(callback);

export default { connect, disconnect, drop };
