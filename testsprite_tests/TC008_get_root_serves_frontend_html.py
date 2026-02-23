import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_root_serves_frontend_html():
    try:
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to root endpoint failed: {e}"
    
    # Assert status code is 200
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    
    # Assert Content-Type is HTML (index.html)
    content_type = response.headers.get('Content-Type','')
    assert 'text/html' in content_type, f"Expected Content-Type to contain 'text/html', got '{content_type}'"
    
    content = response.text
    # Check that the returned HTML contains references to script.js and style.css
    assert 'index.html' not in content.lower(), "Returned content should be the HTML file itself, not a reference to index.html"
    assert ('<script' in content.lower() or 'script.js' in content), "HTML should reference script.js or include a script tag"
    assert ('style.css' in content or '<link' in content.lower()), "HTML should reference style.css or include a link tag"

test_get_root_serves_frontend_html()