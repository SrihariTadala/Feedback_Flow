/**
 * fileHandler.js
 *
 * Utility module for reading and writing feedback data to/from
 * the local JSON file used as the application's data store.
 * Using synchronous FS operations is fine at this scale; for
 * production you would swap these for a proper database.
 */

const fs   = require("fs");
const path = require("path");

/** Absolute path to the JSON data file. */
const DATA_FILE_PATH = path.join(__dirname, "../data/feedbacks.json");

/**
 * Reads all feedback entries from the JSON file.
 *
 * @returns {Array<Object>} Parsed array of feedback objects.
 *                          Returns an empty array if the file is
 *                          missing, empty, or contains invalid JSON.
 */
function readFeedbacks() {
  try {
    const rawData = fs.readFileSync(DATA_FILE_PATH, "utf-8");

    // Guard against an empty file that would cause JSON.parse to throw
    if (!rawData.trim()) {
      return [];
    }

    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading feedbacks.json:", error.message);
    return [];
  }
}

/**
 * Writes the provided feedback array to the JSON file,
 * replacing any existing content.
 *
 * @param {Array<Object>} feedbacks - The full array of feedback
 *                                    objects to persist.
 * @returns {boolean} true on success, false if an error occurred.
 */
function writeFeedbacks(feedbacks) {
  try {
    // Pretty-print with 2-space indent for human readability
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(feedbacks, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to feedbacks.json:", error.message);
    return false;
  }
}

module.exports = { readFeedbacks, writeFeedbacks };
