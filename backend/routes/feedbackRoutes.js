/**
 * feedbackRoutes.js
 *
 * Defines and exports the Express router that maps HTTP methods
 * and paths to their corresponding controller functions.
 *
 * Registered routes:
 *   POST /submit     → submitFeedback
 *   GET  /feedbacks  → getAllFeedbacks
 */

const express    = require("express");
const router     = express.Router();
const {
  submitFeedback,
  getAllFeedbacks,
} = require("../controllers/feedbackController");

// Accept a new feedback submission
router.post("/submit", submitFeedback);

// Retrieve all stored feedback entries
router.get("/feedbacks", getAllFeedbacks);

module.exports = router;
