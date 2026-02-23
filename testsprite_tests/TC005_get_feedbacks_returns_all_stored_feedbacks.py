import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_get_feedbacks_returns_all_stored_feedbacks():
    url = f"{BASE_URL}/feedbacks"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to GET /feedbacks failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        feedbacks = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(feedbacks, list), "Response JSON is not a list"

    for feedback in feedbacks:
        assert isinstance(feedback, dict), "Each feedback entry should be a dictionary"
        for field in ("id", "name", "email", "message", "timestamp"):
            assert field in feedback, f"Feedback missing expected field: '{field}'"

        # id should be an int
        assert isinstance(feedback["id"], int), "'id' field is not an integer"

        # name, email, message should be non-empty strings
        for field in ("name", "email", "message"):
            value = feedback[field]
            assert isinstance(value, str), f"'{field}' field is not a string"
            assert value.strip() != "", f"'{field}' field is empty or whitespace only"

        # email should contain '@'
        assert "@" in feedback["email"], "'email' field does not contain '@'"

        # timestamp should be a non-empty string (ISO format assumed but not strictly validated here)
        timestamp = feedback["timestamp"]
        assert isinstance(timestamp, str), "'timestamp' field is not a string"
        assert timestamp.strip() != "", "'timestamp' field is empty or whitespace only"


test_get_feedbacks_returns_all_stored_feedbacks()