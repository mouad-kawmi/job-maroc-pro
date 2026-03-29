import sqlite3
import json
import time
import os
import sys
import re
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

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
MAX_META_DESCRIPTION_LENGTH = 160
MAX_TELEGRAM_POST_LENGTH = 280
PLACEHOLDER_SITE_HOSTS = {
    "example.com",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "your-domain.com",
}


def get_public_site_url():
    raw_url = (
        os.getenv("SITE_URL", "").strip()
        or os.getenv("NEXT_PUBLIC_SITE_URL", "").strip()
    )
    if not raw_url:
        return ""

    normalized = raw_url.rstrip("/")
    parsed = urlparse(normalized)
    host = (parsed.hostname or "").lower()

    if parsed.scheme not in {"http", "https"} or not host:
        print(f"[!] Invalid SITE_URL '{raw_url}'. Falling back to source links.")
        return ""

    if host in PLACEHOLDER_SITE_HOSTS or host.endswith(".localhost"):
        return ""

    return normalized


SITE_URL = get_public_site_url()


def _has_meaningful_text(value):
    normalized = _normalize_inline_text(value)
    if not normalized:
        return False
    return normalized.upper() not in {"N/A", "NA", "NONE", "NULL", "-"}

def _strip_rich_text(value):
    text = str(value or "")
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[.*?\]\(.*?\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\((.*?)\)", r"\1", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_>~\-]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def _truncate_text(value, limit=MAX_META_DESCRIPTION_LENGTH):
    value = (value or "").strip()
    if len(value) <= limit:
        return value
    return f"{value[:limit - 3].strip()}..."

def _normalize_inline_text(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()

def ensure_meta_description(job_data):
    existing = _truncate_text(job_data.get("meta_description", ""))
    if existing:
        return existing

    plain_text = _strip_rich_text(
        job_data.get("content_html", "") or job_data.get("full_description", "")
    )
    if plain_text:
        return _truncate_text(plain_text)

    title = job_data.get("title", "").strip()
    organization = job_data.get("organization", "").strip()
    fallback = f"Consultez les details de l'offre {title} chez {organization} sur JOB MAROC PRO."
    return _truncate_text(fallback)

def ensure_telegram_post(job_data):
    existing = _truncate_text(
        _normalize_inline_text(job_data.get("telegram_post", "")),
        limit=MAX_TELEGRAM_POST_LENGTH,
    )
    if existing:
        return existing

    title = _normalize_inline_text(job_data.get("title", ""))
    organization = _normalize_inline_text(job_data.get("organization", ""))
    deadline = _normalize_inline_text(job_data.get("deadline", ""))
    preview = _normalize_inline_text(
        job_data.get("meta_description", "")
        or _strip_rich_text(job_data.get("content_html", "") or job_data.get("full_description", ""))
    )

    lines = []
    headline = title or "Nouvelle opportunite au Maroc"
    if organization:
        headline = f"{headline} - {organization}"
    lines.append(headline)

    if _has_meaningful_text(deadline):
        lines.append(f"Date limite: {deadline}")

    if preview:
        lines.append(preview)

    lines.append("#emploi #maroc")
    return _truncate_text("\n".join(lines), limit=MAX_TELEGRAM_POST_LENGTH)

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


def build_public_job_url(job_id, source_url):
    if SITE_URL:
        return f"{SITE_URL}/jobs/{job_id}"
    return source_url

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

    if SITE_URL:
        print(f"[*] Public job links enabled with SITE_URL: {SITE_URL}")
    else:
        print("[*] SITE_URL not configured with a public domain. Google indexing is disabled and Telegram will use source links.")

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
            
        job['meta_description'] = ensure_meta_description(job)
        job['telegram_post'] = ensure_telegram_post(job)

        # 4. Save to Database
        job_id = save_job_to_db(job)
        if job_id:
            print(f"[+] Saved to DB (ID: {job_id}): {job['title']}")

            new_post_url = build_public_job_url(job_id, job["url"])

            # Only notify Google after a real public site URL is configured.
            if SITE_URL:
                indexing_api.notify_google_new_url(new_post_url)

            # 5. Notify Telegram
            msg = telegram_notify.build_job_message(job, new_post_url)
            telegram_notify.send_telegram_msg(msg)

        # Politeness delay
        time.sleep(2)

    print("[+] All done! Automation core is updated.")

if __name__ == "__main__":
    main_flow()
