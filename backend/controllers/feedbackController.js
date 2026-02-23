/**
 * feedbackController.js
 *
 * Contains the business logic for every feedback-related route.
 * Controllers receive the validated request, interact with the
 * data layer (fileHandler), and send a structured JSON response
 * back to the client.
 */

const { readFeedbacks, writeFeedbacks } = require("../utils/fileHandler");

/**
 * POST /submit
 *
 * Validates the incoming feedback payload, generates a unique ID
 * and timestamp, appends the entry to the JSON file, then returns
 * a success confirmation to the client.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function submitFeedback(req, res) {
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

  // --- Build and persist the feedback entry -------------------------------

  const existingFeedbacks = readFeedbacks();

  // Auto-increment ID based on the current number of entries
  const newId = existingFeedbacks.length > 0
    ? existingFeedbacks[existingFeedbacks.length - 1].id + 1
    : 1;

  const newFeedback = {
    id:        newId,
    name:      trimmedName,
    email:     trimmedEmail,
    message:   trimmedMessage,
    timestamp: new Date().toISOString(),
  };

  console.log(`New feedback received from ${trimmedName}`);

  const updatedFeedbacks = [...existingFeedbacks, newFeedback];
  const saveSuccess      = writeFeedbacks(updatedFeedbacks);

  if (!saveSuccess) {
    return res.status(500).json({
      status: "error",
      message: "Failed to save feedback. Please try again later.",
    });
  }

  console.log("Feedback stored successfully in data/feedbacks.json");

  return res.status(200).json({
    status:  "success",
    message: "Feedback submitted successfully!",
  });
}

/**
 * GET /feedbacks
 *
 * Reads all stored feedback entries from the JSON file and
 * returns them as a JSON array. Returns an empty array when
 * no feedback has been submitted yet.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function getAllFeedbacks(req, res) {
  const feedbacks = readFeedbacks();

  return res.status(200).json(feedbacks);
}

module.exports = { submitFeedback, getAllFeedbacks };
