import requests

BASE_URL = "http://localhost:3000"
SUBMIT_ENDPOINT = f"{BASE_URL}/submit"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_post_submit_missing_required_fields():
    test_cases = [
        ({"email": "user@example.com", "message": "Test message"}, "name"),  # Missing name
        ({"name": "User", "message": "Test message"}, "email"),             # Missing email
        ({"name": "User", "email": "user@example.com"}, "message"),         # Missing message
        ({}, "name,email,message")                                          # Missing all
    ]
    for payload, missing_fields in test_cases:
        try:
            response = requests.post(SUBMIT_ENDPOINT, json=payload, headers=HEADERS, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        assert response.status_code == 400, f"Expected 400 status for missing fields {missing_fields}, got {response.status_code}"
        try:
            json_resp = response.json()
        except ValueError:
            assert False, "Response is not valid JSON"

        error_message = json_resp.get("error") or json_resp.get("message") or json_resp.get("validationError")
        assert error_message is not None, "Expected error message in response JSON for missing required fields"
        # Check that the error message mentions the missing fields
        missing_fields_list = missing_fields.split(",")
        for field in missing_fields_list:
            assert field.strip().lower() in error_message.lower(), f"Error message does not mention missing field '{field.strip()}'"

test_post_submit_missing_required_fields()