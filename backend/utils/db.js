/**
 * db.js
 *
 * MongoDB Atlas connection utility.
 *
 * Vercel serverless functions are short-lived but can be "warm" — meaning
 * the Node.js process is reused for subsequent requests within a short
 * window. Caching the MongoClient at module scope ensures we reuse an
 * existing open connection on warm invocations instead of opening a new
 * TCP connection on every single request (which would be slow and would
 * exhaust Atlas's connection limit on the free M0 tier).
 *
 * Usage:
 *   const { connectDB } = require("../utils/db");
 *   const db = await connectDB();
 *   const collection = db.collection("feedbacks");
 */

const { MongoClient } = require("mongodb");

// Module-level cache so the connection persists across warm invocations
let cachedClient = null;
let cachedDb     = null;

/**
 * Returns a connected MongoDB database instance.
 * Creates a new connection on the first call; returns the cached one
 * on all subsequent calls within the same process lifetime.
 *
 * @returns {Promise<import('mongodb').Db>} Connected MongoDB Db instance.
 * @throws  {Error} If MONGODB_URI is not set in the environment.
 */
async function connectDB() {
  // Return the cached database if the connection is already open
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. " +
      "Add it to your .env file (local) or Vercel project settings (production)."
    );
  }

  // Open a new connection and cache both the client and the database
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();

  // "feedback-flow" is the database name; Atlas creates it automatically
  // on the first write if it does not already exist.
  cachedDb = cachedClient.db("feedback-flow");

  return cachedDb;
}

module.exports = { connectDB };
