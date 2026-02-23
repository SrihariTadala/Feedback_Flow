import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_submit_invalid_email_format():
    url = f"{BASE_URL}/submit"
    headers = {"Content-Type": "application/json"}
    payload = {
        "name": "Test User",
        "email": "invalidemailformat.com",  # Missing '@'
        "message": "This is a test message with invalid email."
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400, f"Expected status code 400 but got {response.status_code}"
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"
    assert "error" in resp_json or "message" in resp_json, "Response JSON should contain error or message field"
    error_message = resp_json.get("error") or resp_json.get("message") or ""
    assert ("email" in error_message.lower() or "invalid" in error_message.lower()), \
        f"Error message should indicate invalid email format, got: {error_message}"

test_post_submit_invalid_email_format()