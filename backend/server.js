/**
 * server.js
 *
 * Application entry point.
 *
 * Responsibilities:
 *  - Configure and export the Express application.
 *  - Apply global middleware (JSON body parsing, CORS, static files).
 *  - Mount the feedback router so all API routes are registered.
 *  - Serve the frontend from the /frontend directory via express.static.
 *  - Start the HTTP server only when running locally (not on Vercel).
 *
 * Vercel imports this file via api/index.js and uses the exported Express
 * app directly as a serverless function handler — so app.listen() must
 * NOT be called in that environment.
 */

// Load .env file when running locally so MONGODB_URI is available.
// dotenv is a no-op if the file doesn't exist, which is safe in production.
require("dotenv").config();

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
// Start server — only when running locally, not on Vercel
// ---------------------------------------------------------------------------
// The VERCEL environment variable is automatically set to "1" by the Vercel
// runtime. Skipping app.listen() there avoids the "address already in use"
// error that would otherwise occur because Vercel manages the HTTP server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app so Vercel (via api/index.js) can use it as a handler
module.exports = app;
