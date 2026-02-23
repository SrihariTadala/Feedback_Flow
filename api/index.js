/**
 * api/index.js
 *
 * Vercel serverless entry point.
 *
 * Vercel looks for a default export (or module.exports) from files inside
 * the /api directory and uses them as serverless function handlers.
 * Exporting the Express app directly lets Vercel treat the entire
 * Express application as a single serverless function, preserving all
 * existing middleware, routes, and static-file serving without any
 * structural changes to the backend.
 */

module.exports = require("../backend/server");
