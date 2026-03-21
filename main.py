import sqlite3
import json
import time
import os

# --- CONFIGURE YOUR SITE URL ---
SITE_URL = "https://YOURSITE.com"

# Import custom modules
from scraper import scrape_emploi_public
import ai_rewriter
import telegram_notify
import indexing_api

DB_FILE = "web/jobs.db"

def init_db():
    # Create the web/ directory if it doesn't exist (needed for GitHub Actions)
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            organization TEXT,
            title TEXT,
            posts TEXT,
            deadline TEXT,
            url TEXT UNIQUE,
            content_html TEXT,
            full_description TEXT,
            title_fr TEXT,
            organization_fr TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_job_to_db(job_data):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO jobs (organization, title, posts, deadline, url, content_html, full_description, title_fr, organization_fr)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (job_data['organization'], job_data['title'], job_data['posts'], 
              job_data['deadline'], job_data['url'], job_data['content_html'], 
              job_data.get('full_description', ''), job_data.get('title_fr', ''), job_data.get('organization_fr', '')))
        last_id = cursor.lastrowid
        conn.commit()
        return last_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def is_already_scraped(url):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM jobs WHERE url = ?", (url,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

def main_flow():
    init_db()
    
    # 1. Scrape
    print("[*] STEP 1: Scraping latest jobs (Deep Scrape)...")
    raw_jobs = scrape_emploi_public()
    if not raw_jobs:
        print("[!] No jobs found.")
        return

    # 2. Filter & Process
    new_jobs = [j for j in raw_jobs if not is_already_scraped(j['url'])]
    
    if not new_jobs:
        print("[+] No NEW jobs to process.")
        return

    print(f"[+] Found {len(new_jobs)} NEW jobs.")

    # 3. Setup Gemini
    client = ai_rewriter.setup_gemini()
    if not client:
        print("[!] Gemini API not configured.")
        return

    for i, job in enumerate(new_jobs):
        print(f"[*] Post ({i+1}/{len(new_jobs)}): {job['title']}")
        
        # AI Rewrite (Uses full_description from scraper)
        rewritten_data = ai_rewriter.rewrite_job(client, job)
        if not rewritten_data:
            continue
            
        job['content_html'] = rewritten_data.get('content_html', '')
        job['title_fr'] = rewritten_data.get('title_fr', '')
        job['organization_fr'] = rewritten_data.get('organization_fr', '')
        
        # 4. Save to Database
        job_id = save_job_to_db(job)
        if job_id:
            print(f"[+] Saved to DB (ID: {job_id}): {job['title']}")
            
            # --- NEXT: Notify Google (Google Indexing API) ---
            new_post_url = f"{SITE_URL}/jobs/{job_id}"
            indexing_api.notify_google_new_url(new_post_url)
            
            # Optional: Notify Telegram
            msg = f"🆕 *جديد المباريات:* \n🔹 *{job['title']}*\n🔗 [تفاصيل أكثر]({new_post_url})"
            telegram_notify.send_telegram_msg(msg)
        
        time.sleep(2)

    print("[+] All done! Automation core is updated.")

if __name__ == "__main__":
    main_flow()
