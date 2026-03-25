import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURE YOUR TELEGRAM HERE ---
# Now reading from .env file securely
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
MARKDOWN_V2_SPECIAL_CHARS = re.compile(r'([_*\[\]()~`>#+\-=|{}.!])')

def escape_markdown_v2(text):
    if not text:
        return ""
    return MARKDOWN_V2_SPECIAL_CHARS.sub(r'\\\1', str(text))

def build_job_message(job, details_url):
    details_label = escape_markdown_v2("التسجيل والتفاصيل الكاملة من هنا")

    if job.get("telegram_post"):
        body = escape_markdown_v2(job["telegram_post"].strip())
        return f"{body}\n\n🔗 [{details_label}]({details_url})"

    intro = escape_markdown_v2("جديد المباريات:")
    title = escape_markdown_v2(job.get("title", ""))
    organization = escape_markdown_v2(job.get("organization", ""))
    link_label = escape_markdown_v2("تفاصيل أكثر")

    lines = [f"🆕 *{intro}*"]
    if title:
        lines.append(f"🔹 *{title}*")
    if organization:
        lines.append(f"🏢 *{organization}*")
    lines.append(f"🔗 [{link_label}]({details_url})")
    return "\n".join(lines)

def send_telegram_msg(msg):
    # Only try to send if we have both TOKEN and CHAT_ID configured
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        # print("[!] Telegram not configured. Skipping.")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": msg,
        "parse_mode": "MarkdownV2"
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code != 200:
            print(f"[!] Telegram Error {response.status_code}: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"[!] Error sending to Telegram: {e}")
        return False

if __name__ == "__main__":
    # Test message to verify setup
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        print("[*] Testing Telegram Notification...")
        if send_telegram_msg("🚀 *Bot Setup Success!* \nYour job scraper is now connected to Telegram."):
            print("[+] Success! Check your Telegram.")
        else:
            print("[-] Failed to send message. Is your Chat ID correct?")
    else:
        print("[!] ERROR: Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file.")
        print("[*] Tip: Send a message to your bot and check: https://api.telegram.org/bot<TOKEN>/getUpdates")
