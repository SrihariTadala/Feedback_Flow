/**
 * server.js
 *
 * Application entry point.
 *
 * Responsibilities:
 *  - Boot an Express HTTP server on port 3000.
 *  - Apply global middleware (JSON body parsing, CORS, static files).
 *  - Mount the feedback router so all API routes are registered.
 *  - Serve the frontend build from the /frontend directory.
 */

const express        = require("express");
const cors           = require("cors");
const path           = require("path");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Parse incoming JSON request bodies (needed for POST /submit)
app.use(express.json());

// Allow cross-origin requests – useful when the frontend is served from a
// different origin during local development or API testing (e.g. TestSprite)
app.use(cors());

// Serve all static frontend files (HTML, CSS, JS) from the /frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Mount all feedback-related endpoints under the root path
// This gives us: POST /submit  and  GET /feedbacks
app.use("/", feedbackRoutes);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
