import sqlite3
import json
import time
import os
import sys

# --- CONFIGURE YOUR SITE URL ---
SITE_URL = "https://job-maroc.pro"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(errors="backslashreplace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(errors="backslashreplace")

# Import custom modules
from scraper import scrape_all_sources, get_job_details
import ai_rewriter
import telegram_notify
import indexing_api

DB_FILE = "web/jobs.db"

def init_db():
    # Create the web/ directory if it doesn't exist
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
    try:
        cursor.execute('ALTER TABLE jobs ADD COLUMN meta_description TEXT')
    except Exception:
        pass
    try:
        cursor.execute('ALTER TABLE jobs ADD COLUMN telegram_post TEXT')
    except Exception:
        pass
    conn.commit()
    conn.close()

def save_job_to_db(job_data):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO jobs (organization, title, posts, deadline, url, content_html, full_description, title_fr, organization_fr, meta_description, telegram_post)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (job_data['organization'], job_data['title'], job_data['posts'],
              job_data['deadline'], job_data['url'], job_data['content_html'],
              job_data.get('full_description', ''), job_data.get('title_fr', ''), job_data.get('organization_fr', ''),
              job_data.get('meta_description', ''), job_data.get('telegram_post', '')))
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

    # 1. Scrape only the list first (efficient)
    print("[*] STEP 1: Scraping latest jobs list...")
    scraped_list = scrape_all_sources()
    if not scraped_list:
        print("[!] No jobs found.")
        return

    # 2. Filter out already scraped ones BEFORE doing deep scrape
    new_jobs = [j for j in scraped_list if not is_already_scraped(j['url'])]

    if not new_jobs:
        print("[+] No NEW jobs to process.")
        return

    print(f"[+] Found {len(new_jobs)} NEW jobs.")

    # 3. Setup Gemini/Groq
    model = ai_rewriter.setup_gemini()
    # It might be None if key is missing, but AI rewriter has fallbacks handled below

    for i, job in enumerate(new_jobs):
        print(f"[*] Processing ({i+1}/{len(new_jobs)}): {job['title']}")

        # Deep Scrape: only fetch details for truly NEW jobs
        print(f"[*] Fetching details for: {job['url']}...")
        job['full_description'] = get_job_details(job['url'])

        # AI Rewrite
        rewritten_data = None
        if model:
            rewritten_data = ai_rewriter.rewrite_job(model, job)

        if rewritten_data and rewritten_data.get('content_html'):
            job['content_html'] = rewritten_data.get('content_html', '')
            job['title_fr'] = rewritten_data.get('title_fr', '')
            job['organization_fr'] = rewritten_data.get('organization_fr', '')
            job['meta_description'] = rewritten_data.get('meta_description', '')
            job['telegram_post'] = rewritten_data.get('telegram_post', '')
        elif rewritten_data:
            print("[!] AI returned partial data, using fallback content.")
            raw_desc = job.get('full_description', '').strip()
            if not raw_desc or raw_desc == "No description available.":
                raw_desc = f"### {job.get('title', '')}\n\n[Source]({job['url']})"

            job['content_html'] = raw_desc
            job['title_fr'] = rewritten_data.get('title_fr', '') or job.get('title', '')
            job['organization_fr'] = rewritten_data.get('organization_fr', '') or job.get('organization', '')
            job['meta_description'] = rewritten_data.get('meta_description', '')
            job['telegram_post'] = rewritten_data.get('telegram_post', '')
        else:
            print("[!] AI failed or skipped, using fallback format.")
            raw_desc = job.get('full_description', '').strip()
            if not raw_desc or raw_desc == "No description available.":
                raw_desc = f"### {job.get('title', '')}\n\n* **المؤسسة:** {job.get('organization', '')}\n* **عدد المناصب:** {job.get('posts', '')}\n* **آخر أجل:** {job.get('deadline', '')}\n\n[يرجى زيارة رابط التسجيل الأصلي لمعرفة الشروط والتفاصيل الكاملة للإعلان]({job['url']})"
            
            job['content_html'] = raw_desc
            job['title_fr'] = job.get('title', '')
            job['organization_fr'] = job.get('organization', '')
            
        # 4. Save to Database
        job_id = save_job_to_db(job)
        if job_id:
            print(f"[+] Saved to DB (ID: {job_id}): {job['title']}")

            # --- NEXT: Notify Google (Google Indexing API) ---
            new_post_url = f"{SITE_URL}/jobs/{job_id}"
            indexing_api.notify_google_new_url(new_post_url)

            # 5. Notify Telegram
            msg = telegram_notify.build_job_message(job, new_post_url)
            telegram_notify.send_telegram_msg(msg)

        # Politeness delay
        time.sleep(2)

    print("[+] All done! Automation core is updated.")

if __name__ == "__main__":
    main_flow()
