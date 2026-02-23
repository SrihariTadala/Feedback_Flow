/**
 * feedbackController.js
 *
 * Contains the business logic for every feedback-related route.
 * Controllers receive the validated request, interact with the
 * data layer (MongoDB via db.js), and send a structured JSON response
 * back to the client.
 *
 * Both handlers are async because MongoDB operations are Promise-based.
 */

const { connectDB } = require("../utils/db");

/** Name of the MongoDB collection that stores feedback documents. */
const COLLECTION_NAME = "feedbacks";

/**
 * POST /submit
 *
 * Validates the incoming feedback payload, generates a sequential ID
 * and timestamp, inserts the document into MongoDB, then returns
 * a success confirmation to the client.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function submitFeedback(req, res) {
  const { name, email, message } = req.body;

  // --- Input validation ---------------------------------------------------

  // Ensure all three fields are present and non-empty
  if (!name || !email || !message) {
    return res.status(400).json({
      status: "error",
      message: "All fields (name, email, message) are required.",
    });
  }

  // Basic email format check: must contain the "@" character
  if (!email.includes("@")) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a valid email address.",
    });
  }

  // Trim whitespace to avoid storing extra spaces
  const trimmedName    = name.trim();
  const trimmedEmail   = email.trim();
  const trimmedMessage = message.trim();

  // Double-check after trimming in case the field was only whitespace
  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return res.status(400).json({
      status: "error",
      message: "Fields must not be blank or whitespace only.",
    });
  }

  // --- Build and persist the feedback entry in MongoDB --------------------

  try {
    const db         = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    // Derive a sequential ID from the current document count.
    // countDocuments() is an atomic read on the server side, which is
    // significantly safer than reading the last array item as fileHandler
    // previously did (still not collision-proof under high concurrency,
    // but acceptable for this project's single-user scale).
    const count = await collection.countDocuments();

    const newFeedback = {
      id:        count + 1,
      name:      trimmedName,
      email:     trimmedEmail,
      message:   trimmedMessage,
      timestamp: new Date().toISOString(),
    };

    console.log(`New feedback received from ${trimmedName}`);

    // insertOne stores the document; MongoDB adds an internal _id automatically
    await collection.insertOne(newFeedback);

    console.log("Feedback stored successfully in MongoDB Atlas");

    return res.status(200).json({
      status:  "success",
      message: "Feedback submitted successfully!",
    });

  } catch (error) {
    console.error("Database error on POST /submit:", error.message);
    return res.status(500).json({
      status:  "error",
      message: "Failed to save feedback. Please try again later.",
    });
  }
}

/**
 * GET /feedbacks
 *
 * Retrieves all stored feedback entries from MongoDB and returns them
 * as a JSON array sorted by ascending ID.
 * Returns an empty array when no feedback has been submitted yet.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function getAllFeedbacks(req, res) {
  try {
    const db         = await connectDB();
    const collection = db.collection(COLLECTION_NAME);

    // Exclude MongoDB's internal _id field from the response so the API
    // output matches the original file-based format exactly.
    const feedbacks = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    return res.status(200).json(feedbacks);

  } catch (error) {
    console.error("Database error on GET /feedbacks:", error.message);
    return res.status(500).json({
      status:  "error",
      message: "Failed to retrieve feedbacks. Please try again later.",
    });
  }
}

module.exports = { submitFeedback, getAllFeedbacks };
