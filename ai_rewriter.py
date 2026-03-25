import requests
import json
import os
import time

from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURE YOUR API KEYS ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free"

def setup_gemini():
    """Returns a dict with configured API keys"""
    keys = {
        "groq": GROQ_API_KEY,
        "openrouter": OPENROUTER_API_KEY,
        "gemini": GEMINI_API_KEY
    }
    if not any(keys.values()):
        print("[!] ERROR: Please set GROQ_API_KEY, OPENROUTER_API_KEY or GEMINI_API_KEY in .env or GitHub Secrets!")
        return None
    return keys

def _parse_ai_json(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    elif text.startswith("```"):
        text = text[3:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    try:
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1], strict=False)
        raise

def rewrite_with_openai_format(api_key, url, model, prompt):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    # OpenRouter requires HTTP-Referer for rankings
    if "openrouter" in url:
        headers["HTTP-Referer"] = "https://job-maroc.pro"
        headers["X-Title"] = "Job Maroc Pro"

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    if response.status_code != 200:
        print(f"[!] Error {response.status_code} from {url}: {response.text[:200]}")
    response.raise_for_status()
    text = response.json()["choices"][0]["message"]["content"].strip()
    return _parse_ai_json(text)

def rewrite_with_gemini(api_key, prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3}
    }
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    if response.status_code != 200:
        print(f"[!] Error {response.status_code} from Gemini: {response.text[:200]}")
    response.raise_for_status()
    text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    return _parse_ai_json(text)

def ask_ai_json(keys, prompt):
    if keys.get("groq"):
        try:
            return rewrite_with_openai_format(keys["groq"], GROQ_URL, GROQ_MODEL, prompt)
        except Exception as e:
            print(f"[-] Groq failed in pipeline step. Falling back to OpenRouter... Error: {e}")

    if keys.get("openrouter"):
        try:
            return rewrite_with_openai_format(keys["openrouter"], OPENROUTER_URL, OPENROUTER_MODEL, prompt)
        except Exception as e:
            print(f"[-] OpenRouter failed. Falling back to Gemini... Error: {e}")

    if keys.get("gemini"):
        try:
            return rewrite_with_gemini(keys["gemini"], prompt)
        except Exception as e:
            print(f"[!] Gemini failed: {e}")

    return None

def rewrite_job(keys, job_data):
    if not keys: return None

    print(f"[*] Starting Multi-Step AI Pipeline for: {job_data['title']}")

    final_output = {
        "title_fr": "",
        "organization_fr": "",
        "content_html": "",
        "meta_description": "",
        "telegram_post": ""
    }

    # ---------------------------------------------------------
    # Step 1: Generate catching Title & Translations
    # ---------------------------------------------------------
    print("  -> Step 1: Title and Translations...")
    prompt_1 = f"""أنت خبير سيو للتوظيف. يجب الإجابة حصرياً بصيغة JSON.
    المؤسسة: {job_data['organization']}
    المنصب: {job_data['title']}

    استخرج العناوين بدقة وأرجع هذا الـ JSON فقط بدون إضافات ولا شروحات:
    {{
      "title_ar": "عنوان جذاب لـ {job_data['title']}",
      "title_fr": "Traduction exacte en français du titre",
      "organization_fr": "Traduction exacte en français de l'organisation"
    }}"""
    res_1 = ask_ai_json(keys, prompt_1)
    if res_1:
         job_data["title"] = res_1.get("title_ar", job_data["title"])
         final_output["title_fr"] = res_1.get("title_fr", "")
         final_output["organization_fr"] = res_1.get("organization_fr", "")
         print("     [OK] Success")
    else:
         print("     [FAIL] Failed Step 1 (Falling back)")
         return None

    # ---------------------------------------------------------
    # Step 2: Rewrite article SEO friendly
    # ---------------------------------------------------------
    print("  -> Step 2: SEO Article Rewriting...")
    prompt_2 = f"""أنت خبير محتوى التوظيف. الإجابة حصرياً بصيغة JSON.
    العنوان الجديد: {job_data['title']}
    التفاصيل الأصلية: {job_data.get('full_description', 'N/A')}

    أعد كتابة الإعلان بشكل مفصل واحترافي بصيغة Markdown باللغتين العربية وتحتها الفرنسية للقسم الخاص بها بـ (Annonce).
    تأكد من كتابة الشروط وطريقة التقديم بشكل بوليتس، وأن الإخراج يكون JSON فقط هكذا:
    {{
      "content_html": "محتوى Markdown الكامل هنا"
    }}"""
    res_2 = ask_ai_json(keys, prompt_2)
    if res_2:
         final_output["content_html"] = res_2.get("content_html", "")
         print("     [OK] Success")
    else:
         print("     [FAIL] Failed Step 2")
         return final_output if final_output.get("title_fr") else None

    # ---------------------------------------------------------
    # Step 3: Meta Description
    # ---------------------------------------------------------
    print("  -> Step 3: Meta Description...")
    prompt_3 = f"""يجب الإجابة حصرياً بصيغة JSON.
    لخص فقرة الإعلان هذه في وصف قصير لمحركات البحث (Meta Description) بحيث لا يتجاوز 160 حرف.
    المقال: {final_output['content_html'][:800]}

    أرجع هذا الـ JSON فقط:
    {{
      "meta_description": "{{الوصف المستخرج هنا}}"
    }}"""
    res_3 = ask_ai_json(keys, prompt_3)
    if res_3:
         final_output["meta_description"] = res_3.get("meta_description", "")
         print("     [OK] Success")

    # ---------------------------------------------------------
    # Step 4: Telegram Post
    # ---------------------------------------------------------
    print("  -> Step 4: Telegram Post...")
    prompt_4 = f"""يجب الإجابة حصرياً بصيغة JSON.
    الموعد النهائي: {job_data['deadline']}
    المنصب: {job_data['title']}
    المؤسسة: {job_data['organization']}
    الوصف المختصر: {final_output['meta_description']}

    اكتب منشور تيليغرام صغير جداً ومشوق. استخدم إيموجي ومسافات وهاشتاجات المغرب (دون أي رابط).
    أرجع هذا الـ JSON فقط:
    {{
      "telegram_post": "{{محتوى المنشور هنا بدون رابط}}"
    }}"""
    res_4 = ask_ai_json(keys, prompt_4)
    if res_4:
         final_output["telegram_post"] = res_4.get("telegram_post", "")
         print("     [OK] Success")

    return final_output

def process_all_jobs():
    keys = setup_gemini()
    if not keys:
        return

    try:
        with open('latest_jobs.json', 'r', encoding='utf-8') as f:
            jobs = json.load(f)
    except FileNotFoundError:
        print("[!] latest_jobs.json not found. Run scraper.py first.")
        return

    rewritten_jobs = []
    print(f"[*] Processing {len(jobs)} jobs...")

    for i, job in enumerate(jobs):
        print(f"[*] Post {i+1}/{len(jobs)}: {job['title']}...")
        content = rewrite_job(keys, job)
        if content:
            job['content_html'] = content.get('content_html', '')
            job['title_fr'] = content.get('title_fr', '')
            job['organization_fr'] = content.get('organization_fr', '')
            job['meta_description'] = content.get('meta_description', '')
            job['telegram_post'] = content.get('telegram_post', '')
            rewritten_jobs.append(job)

        time.sleep(2)

    with open('rewritten_jobs.json', 'w', encoding='utf-8') as f:
        json.dump(rewritten_jobs, f, ensure_ascii=False, indent=4)

    print(f"[+] Success! {len(rewritten_jobs)} jobs rewritten and saved.")

if __name__ == "__main__":
    process_all_jobs()
