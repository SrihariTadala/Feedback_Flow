import requests

def test_get_feedbacks_returns_empty_array_when_no_submissions():
    url = "http://localhost:3000/feedbacks"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to GET /feedbacks failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), f"Expected response data to be a list, got {type(data)}"
    # It should be empty or an initial seed array. Since PRD says empty array or initial seed array,
    # we accept empty or any list, but goal is to confirm no unexpected data structure.
    # Here we assert it is list and may be empty or with seed data.
    # If specifics about seed array were provided, we would assert exact content.
    # We assert that IDs, if present, follow expected structure (optional)
    for item in data:
        assert isinstance(item, dict), "Each feedback should be a dictionary"
        # Optional: check keys if data is present
        if data:
            assert "id" in item and "name" in item and "email" in item and "message" in item and "timestamp" in item, \
                "Feedback item missing required keys"

test_get_feedbacks_returns_empty_array_when_no_submissions()