import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import json
import os

# --- CONFIGURE YOUR SERVICE ACCOUNT JSON HERE ---
# Get it from Google Cloud Console (Indexing API)
SERVICE_ACCOUNT_FILE = "web/service_account.json"

def get_access_token():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print("[!] Indexing API Error: service_account.json not found.")
        return None
        
    scopes = ["https://www.googleapis.com/auth/indexing"]
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=scopes
    )
    
    # Refresh the token
    auth_request = Request()
    credentials.refresh(auth_request)
    return credentials.token

def notify_google_new_url(url):
    token = get_access_token()
    if not token:
        return False

    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    body = {
        "url": url,
        "type": "URL_UPDATED" # Use URL_UPDATED for both new posts and modifications
    }

    try:
        response = requests.post(endpoint, headers=headers, json=body)
        if response.status_code == 200:
            print(f"[+] Google Indexing Success: {url}")
            return True
        else:
            print(f"[!] Google Indexing Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[!] Google Indexing Exception: {e}")
        return False

if __name__ == "__main__":
    # Test (Replace with your actual site URL)
    # notify_google_new_url("https://yoursite.com/jobs/1")
    pass
