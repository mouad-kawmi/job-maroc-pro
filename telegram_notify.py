import requests

# --- CONFIGURE YOUR TELEGRAM HERE ---
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
TELEGRAM_CHAT_ID = "@YOUR_CHANNEL_USERNAME" # Or numeric ID

def send_telegram_msg(msg):
    if TELEGRAM_BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("[!] Telegram not configured. Skipping.")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": msg,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200
    except Exception as e:
        print(f"[!] Error sending to Telegram: {e}")
        return False

if __name__ == "__main__":
    # Test message
    send_telegram_msg("*Test Message:* Hi developer!")
