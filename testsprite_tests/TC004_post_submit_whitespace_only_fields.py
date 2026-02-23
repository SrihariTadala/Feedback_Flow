import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_submit_whitespace_only_fields():
    url = f"{BASE_URL}/submit"
    headers = {"Content-Type": "application/json"}
    payload = {
        "name": "   ",
        "email": "   ",
        "message": "   "
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"RequestException occurred: {e}"

    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"

    error_message = resp_json.get("error") or resp_json.get("message") or ""
    assert error_message != "", "Error message not found in response"
    # Adjust assertion to expect error message about invalid email or empty fields
    expected_indicators = ["email", "valid email", "empty", "invalid", "whitespace", "required", "missing"]
    assert any(indicator in error_message.lower() for indicator in expected_indicators), (
        f"Error message does not indicate invalid or empty fields: {error_message}"
    )


test_post_submit_whitespace_only_fields()