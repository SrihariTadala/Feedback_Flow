# Feedback Flow (https://feedback-collector-omega-lovat.vercel.app)

A simple full-stack web application that allows users (students, testers, or developers) to submit feedback or bug reports for their projects.



#Features

- **Feedback form** – Submit name, email, and a message via a clean UI.
- **REST API** – Two endpoints (`POST /submit`, `GET /feedbacks`) built with Express.
- **JSON storage** – All entries are persisted to `backend/data/feedbacks.json` (no external DB needed).
- **TestSprite-ready** – Endpoints are structured for automated API testing via the TestSprite MCP Server.

---

## Project Structure

```
feedback-collector/
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── routes/
│   │   └── feedbackRoutes.js      # Route definitions
│   ├── controllers/
│   │   └── feedbackController.js  # Business logic / validation
│   ├── data/
│   │   └── feedbacks.json         # Local JSON data store
│   └── utils/
│       └── fileHandler.js         # Read/write helpers for the JSON file
├── frontend/
│   ├── index.html                 # Feedback form page
│   ├── style.css                  # Responsive styles
│   └── script.js                  # Fetch API interactions
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Install dependencies

```bash
cd feedback-collector
npm install
```

### Start the server

```bash
npm start
```

The server will start on **http://localhost:3000**.

For auto-reload during development:

```bash
npm run dev
```

---

## API Reference

### POST `/submit`

Submit a new piece of feedback.

**Request body (JSON):**

```json
{
    "name": "Srihari Tadala",
    "email": "stadala@example.com",
  "message": "Loved the UI and the simplicity of this project!"
}
```

**Validation rules:**
- All three fields are required and must be non-empty.
- `email` must contain an `@` character.

**Success response `200`:**

```json
{
  "status": "success",
  "message": "Feedback submitted successfully!"
}
```

**Error response `400`:**

```json
{
  "status": "error",
  "message": "All fields (name, email, message) are required."
}
```

---

### GET `/feedbacks`

Retrieve all stored feedback entries.

**Response `200`:**

```json
[
  {
    "id": 1,
    "name": "Srihari Tadala",
    "email": "stadala@example.com",
    "message": "Loved the UI!",
    "timestamp": "2025-10-14T10:20:30.000Z"
  }
]
```

---

## TestSprite Test Cases

| # | Endpoint     | Method | Expected Result                          |
|---|--------------|--------|------------------------------------------|
| 1 | `/submit`    | POST   | `200` + `status: "success"` on valid data |
| 2 | `/submit`    | POST   | `400` + error message when fields missing |
| 3 | `/feedbacks` | GET    | `200` + JSON array of all feedbacks       |
| 4 | `/feedbacks` | GET    | Response is valid JSON format             |
| 5 | `/submit`    | POST   | Data appended to `feedbacks.json`         |

---

## Console Output Example

```
Server running on http://localhost:3000
New feedback received from Prince Kumar
Feedback stored successfully in data/feedbacks.json
```

---

## Project URLs

| Resource              | URL                             |
|-----------------------|---------------------------------|
| Frontend (form page)  | http://localhost:3000           |
| API: Submit Feedback  | http://localhost:3000/submit    |
| API: Get Feedbacks    | http://localhost:3000/feedbacks |
