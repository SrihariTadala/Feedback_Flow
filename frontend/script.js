/**
 * script.js – Feedback Flow
 *
 * Handles all client-side interactivity:
 *  • Intercepts the feedback form submit event.
 *  • Sends a POST request to /submit via the Fetch API.
 *  • Displays success / error messages to the user.
 *  • Fetches and renders all submitted feedbacks from GET /feedbacks.
 */

// ── API base URL ────────────────────────────────────────────────────────────
// Using a relative path so the frontend works whether served via the Express
// static middleware (port 3000) or any other origin-based setup.
const API_BASE = "";

// ── DOM references ──────────────────────────────────────────────────────────
const feedbackForm      = document.getElementById("feedbackForm");
const nameInput         = document.getElementById("name");
const emailInput        = document.getElementById("email");
const messageInput      = document.getElementById("message");
const submitBtn         = document.getElementById("submitBtn");
const alertBox          = document.getElementById("alertBox");
const feedbackListEl    = document.getElementById("feedbackList");
const feedbackCountBadge = document.getElementById("feedbackCount");
const refreshBtn        = document.getElementById("refreshBtn");

// ── Utility helpers ─────────────────────────────────────────────────────────

/**
 * Shows a styled alert box with the given message and type.
 *
 * @param {string} message - Text to display inside the alert.
 * @param {"success"|"error"} type - Controls colour and icon.
 */
function showAlert(message, type) {
  const icon = type === "success" ? "✅" : "❌";

  alertBox.innerHTML = `
    <span class="alert__icon">${icon}</span>
    <span>${message}</span>
  `;

  // Remove both type classes before applying the new one
  alertBox.classList.remove("alert--success", "alert--error", "visible");

  // Force a reflow so the CSS animation re-triggers on repeated calls
  void alertBox.offsetWidth;

  alertBox.classList.add(`alert--${type}`, "visible");

  // Auto-hide the alert after 5 seconds
  setTimeout(() => {
    alertBox.classList.remove("visible");
  }, 5000);
}

/**
 * Toggles the submit button between its normal and loading states.
 *
 * @param {boolean} isLoading - true to show spinner, false to restore.
 */
function setButtonLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("loading", isLoading);
}

/**
 * Formats an ISO timestamp string into a human-readable date/time.
 *
 * @param {string} isoString - ISO 8601 date string from the server.
 * @returns {string} Formatted date, e.g. "Feb 22, 2026, 10:45 AM".
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
  });
}

/**
 * Derives a 1–2 letter initials string from a full name.
 * Used to populate the avatar circle on each feedback card.
 *
 * @param {string} fullName - The submitter's name.
 * @returns {string} Uppercased initials, e.g. "PK" for "Prince Kumar".
 */
function getInitials(fullName) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// ── Render feedbacks ────────────────────────────────────────────────────────

/**
 * Builds and injects HTML for a single feedback entry.
 *
 * @param {Object} feedback - A feedback object from the server.
 * @returns {string} HTML string for one feedback card.
 */
function buildFeedbackCard(feedback) {
  const initials  = getInitials(feedback.name);
  const timestamp = formatTimestamp(feedback.timestamp);

  return `
    <article class="feedback-item" aria-label="Feedback from ${feedback.name}">
      <div class="feedback-item__header">
        <div class="feedback-item__author">
          <div class="avatar" aria-hidden="true">${initials}</div>
          <div>
            <div class="feedback-item__name">${escapeHtml(feedback.name)}</div>
            <div class="feedback-item__email">${escapeHtml(feedback.email)}</div>
          </div>
        </div>
        <time class="feedback-item__timestamp" datetime="${feedback.timestamp}">
          ${timestamp}
        </time>
      </div>
      <blockquote class="feedback-item__message">
        ${escapeHtml(feedback.message)}
      </blockquote>
    </article>
  `;
}

/**
 * Escapes HTML special characters to prevent XSS when rendering
 * user-supplied content directly into the DOM via innerHTML.
 *
 * @param {string} text - Raw user-supplied string.
 * @returns {string} Safe HTML-encoded string.
 */
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Fetches all feedbacks from GET /feedbacks and renders them
 * in the feedback list section. Updates the count badge.
 */
async function loadFeedbacks() {
  try {
    const response = await fetch(`${API_BASE}/feedbacks`);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const feedbacks = await response.json();

    // Update the count badge
    feedbackCountBadge.textContent = feedbacks.length;

    if (feedbacks.length === 0) {
      feedbackListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">💬</div>
          <p>No feedback submitted yet. Be the first!</p>
        </div>
      `;
      return;
    }

    // Render newest first by reversing the array before building cards
    const cardsHtml = [...feedbacks]
      .reverse()
      .map(buildFeedbackCard)
      .join("");

    feedbackListEl.innerHTML = cardsHtml;
  } catch (error) {
    console.error("Failed to load feedbacks:", error);
    feedbackListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <p>Could not load feedbacks. Make sure the server is running.</p>
      </div>
    `;
  }
}

// ── Form submission ─────────────────────────────────────────────────────────

/**
 * Handles the feedback form's submit event.
 * Prevents the default browser navigation, gathers form values,
 * POSTs them to /submit, and processes the server's response.
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const payload = {
    name:    nameInput.value.trim(),
    email:   emailInput.value.trim(),
    message: messageInput.value.trim(),
  };

  // Client-side guard: give instant feedback before hitting the server
  if (!payload.name || !payload.email || !payload.message) {
    showAlert("Please fill in all fields before submitting.", "error");
    return;
  }

  if (!payload.email.includes("@")) {
    showAlert("Please enter a valid email address.", "error");
    return;
  }

  setButtonLoading(true);

  try {
    const response = await fetch(`${API_BASE}/submit`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      showAlert(data.message, "success");
      feedbackForm.reset();            // Clear all form fields
      await loadFeedbacks();           // Refresh the feedbacks list
    } else {
      // Server returned a validation / business-logic error
      showAlert(data.message || "Something went wrong. Please try again.", "error");
    }
  } catch (error) {
    console.error("Submission error:", error);
    showAlert("Could not reach the server. Please check your connection.", "error");
  } finally {
    setButtonLoading(false);
  }
}

// ── Event listeners ─────────────────────────────────────────────────────────

feedbackForm.addEventListener("submit", handleFormSubmit);

// Allow the user to manually refresh the feedbacks list
refreshBtn.addEventListener("click", loadFeedbacks);

// ── Initialise ──────────────────────────────────────────────────────────────

// Load existing feedbacks as soon as the page is ready
document.addEventListener("DOMContentLoaded", loadFeedbacks);
