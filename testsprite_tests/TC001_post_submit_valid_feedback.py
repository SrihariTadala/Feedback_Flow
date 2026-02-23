import requests
import re

BASE_URL = "http://localhost:3000"

def test_post_submit_valid_feedback():
    url = f"{BASE_URL}/submit"
    headers = {"Content-Type": "application/json"}
    payload = {
        "name": "Prince Kumar",
        "email": "prince@example.com",
        "message": "Loved the UI and the simplicity of this project!"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        resp_json = response.json()
        assert resp_json.get("status") == "success", "Response status is not 'success'"
        assert "Feedback submitted successfully" in resp_json.get("message",""), "Success message missing or incorrect"

        # Verify the feedback stored with id and timestamp by fetching feedbacks
        feedbacks_response = requests.get(f"{BASE_URL}/feedbacks", timeout=30)
        assert feedbacks_response.status_code == 200, f"Expected 200 OK for GET /feedbacks but got {feedbacks_response.status_code}"
        feedbacks = feedbacks_response.json()
        assert isinstance(feedbacks, list), "Feedbacks response is not a list"

        # Find the feedback matching our submission with name, email, message
        matched_feedback = None
        for fb in feedbacks:
            if (
                fb.get("name") == payload["name"] and
                fb.get("email") == payload["email"] and
                fb.get("message") == payload["message"]
            ):
                matched_feedback = fb
                break

        assert matched_feedback is not None, "Submitted feedback not found in feedbacks list"
        assert isinstance(matched_feedback.get("id"), int), "Feedback id is not an integer"

        timestamp = matched_feedback.get("timestamp")
        assert isinstance(timestamp, str), "Feedback timestamp is missing or not string"
        # ISO 8601 basic regex check for timestamp
        iso8601_regex = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$"
        assert re.match(iso8601_regex, timestamp), f"Timestamp '{timestamp}' is not a valid ISO format"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_submit_valid_feedback()