import requests

def test_get_nonexistent_static_asset_returns_404():
    base_url = "http://localhost:3000"
    nonexistent_asset_path = "/nonexistent-static-asset"
    url = base_url + nonexistent_asset_path

    try:
        response = requests.get(url, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"

test_get_nonexistent_static_asset_returns_404()