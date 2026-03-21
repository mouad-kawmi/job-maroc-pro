import requests
import json
import base64

# --- CONFIGURE YOUR WORDPRESS HERE ---
WP_URL = "https://YOURSITE.com/wp-json/wp/v2/posts"
WP_USERNAME = "admin"
WP_PASSWORD = "YOUR_APPLICATION_PASSWORD_HERE" # Not your login password!

def post_to_wordpress(title, content):
    if "YOURSITE.com" in WP_URL:
        print("[!] ERROR: Please set your WP_URL and Credentials in wp_poster.py")
        return None
    
    # Auth header (Base64 is common for simple scripts, or use JWT)
    credentials = f"{WP_USERNAME}:{WP_PASSWORD}"
    token = base64.b64encode(credentials.encode())
    headers = {
        'Authorization': f'Basic {token.decode("utf-8")}',
        'Content-Type': 'application/json'
    }

    # Data to post
    data = {
        'title': title,
        'content': content,
        'status': 'publish'  # 'draft' if you want to review first
    }

    try:
        response = requests.post(WP_URL, headers=headers, json=data)
        if response.status_code == 201:
            print(f"[+] Posted successfully: {title}")
            return response.json()['link']
        else:
            print(f"[!] Error posting to WP: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"[!] Exception during WP post: {e}")
        return None

def main():
    try:
        with open('rewritten_jobs.json', 'r', encoding='utf-8') as f:
            jobs = json.load(f)
    except FileNotFoundError:
        print("[!] rewritten_jobs.json not found. Run ai_rewriter.py first.")
        return

    print(f"[*] Starting to post {len(jobs)} jobs to WordPress...")
    
    posted_count = 0
    for job in jobs:
        if 'content_html' in job:
            title = job['title']
            content = job['content_html']
            link = post_to_wordpress(title, content)
            if link:
                posted_count += 1
                # Optional: log posted job IDs to avoid duplication in future runs
        
    print(f"[+] Process finished. Total posted: {posted_count}/{len(jobs)}")

if __name__ == "__main__":
    main()
