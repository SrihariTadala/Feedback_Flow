import requests
import threading
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_submit_concurrent_requests_id_collision():
    submit_url = f"{BASE_URL}/submit"
    feedbacks_url = f"{BASE_URL}/feedbacks"

    payload1 = {
        "name": "User One",
        "email": "userone@example.com",
        "message": "Feedback message from user one."
    }
    payload2 = {
        "name": "User Two",
        "email": "usertwo@example.com",
        "message": "Feedback message from user two."
    }

    responses = [None, None]

    def post_feedback(idx, payload):
        try:
            res = requests.post(submit_url, json=payload, timeout=TIMEOUT)
            responses[idx] = res
        except Exception as e:
            responses[idx] = e

    thread1 = threading.Thread(target=post_feedback, args=(0, payload1))
    thread2 = threading.Thread(target=post_feedback, args=(1, payload2))

    # Start both threads nearly simultaneously
    thread1.start()
    thread2.start()

    thread1.join()
    thread2.join()

    # Assert both requests succeeded with 200
    for res in responses:
        if isinstance(res, Exception):
            raise AssertionError(f"Request raised exception: {res}")
        assert res.status_code == 200, f"Expected 200 OK but got {res.status_code}"
        json_resp = res.json()
        assert json_resp.get("status") == "success", f"Unexpected status in response: {json_resp}"
        assert "Feedback submitted successfully!" in json_resp.get("message", ""), f"Unexpected message: {json_resp}"

    # Allow a brief moment for backend to write both entries
    time.sleep(1)

    # Retrieve all feedbacks to verify both entries appended
    try:
        get_res = requests.get(feedbacks_url, timeout=TIMEOUT)
    except Exception as e:
        raise AssertionError(f"GET /feedbacks request failed: {e}")

    assert get_res.status_code == 200, f"Expected 200 OK from GET /feedbacks but got {get_res.status_code}"
    feedback_list = get_res.json()
    assert isinstance(feedback_list, list), "Expected feedback list to be a JSON array"

    # Check that at least both messages exist in feedback list
    messages = [fb.get("message") for fb in feedback_list if isinstance(fb, dict)]
    assert payload1["message"] in messages, "First feedback message not found in stored feedbacks"
    assert payload2["message"] in messages, "Second feedback message not found in stored feedbacks"

test_post_submit_concurrent_requests_id_collision()