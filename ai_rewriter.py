import requests
import json
import os
import time

from dotenv import load_dotenv

load_dotenv()
# --- CONFIGURE YOUR API KEY IN .env FILE OR GITHUB SECRETS ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

def setup_gemini():
    """Returns the Groq API key (kept name for backward compatibility with main.py)"""
    if not GROQ_API_KEY:
        print("[!] ERROR: Please set your GROQ_API_KEY in a .env file or GitHub Secrets!")
        return None
    return GROQ_API_KEY

def rewrite_job(api_key, job_data):
    prompt = f"""أنت خبير في التوظيف في المغرب بمهارات عالية في الـ SEO.
قم بكتابة تفاصيل التوظيف باللغتين العربية والفرنسية بناءً على هذه البيانات.

المعلومات الخام:
- المؤسسة: {job_data['organization']}
- المسمى الوظيفي: {job_data['title']}
- التفاصيل: {job_data.get('full_description', 'N/A')}
- آخر أجل: {job_data['deadline']}
- الرابط: {job_data['url']}

أرجع JSON فقط بهذا الشكل بالضبط، بدون أي نص خارجه:
{{
  "title_fr": "ترجمة دقيقة للمسمى الوظيفي بالفرنسية",
  "organization_fr": "ترجمة اسم المؤسسة بالفرنسية",
  "content_html": "محتوى Markdown كامل يتضمن: ## الإعلان\\n\\nشرح الإعلان والشروط والوثائق المطلوبة بالعربية بشكل مفصل مع bullet points\\n\\n---\\n\\n## Annonce (Français)\\n\\nترجمة كاملة بالفرنسية مع bullet points"
}}"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 4096
    }
    
    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        text = response.json()["choices"][0]["message"]["content"].strip()
        
        # Parse JSON output securely
        if text.startswith("```json"):
            text = text[7:].strip()
            if text.endswith("```"):
                text = text[:-3].strip()
        elif text.startswith("```"):
            text = text[3:].strip()
            if text.endswith("```"):
                text = text[:-3].strip()
            
        return json.loads(text)
    except requests.HTTPError as e:
        print(f"[!] HTTP Error: {e.response.status_code} - {e.response.text[:300]}")
        return None
    except Exception as e:
        print(f"[!] Error with Groq API or JSON parsing: {e}")
        return None

def process_all_jobs():
    api_key = setup_gemini()
    if not api_key:
        return

    try:
        with open('latest_jobs.json', 'r', encoding='utf-8') as f:
            jobs = json.load(f)
    except FileNotFoundError:
        print("[!] latest_jobs.json not found. Run scraper.py first.")
        return

    rewritten_jobs = []
    print(f"[*] Processing {len(jobs)} jobs with Groq AI (llama-3.3-70b)...")
    
    for i, job in enumerate(jobs):
        print(f"[*] Post {i+1}/{len(jobs)}: {job['title']}...")
        content = rewrite_job(api_key, job)
        if content:
            job['content_html'] = content
            rewritten_jobs.append(job)
        
        time.sleep(2)
        
    with open('rewritten_jobs.json', 'w', encoding='utf-8') as f:
        json.dump(rewritten_jobs, f, ensure_ascii=False, indent=4)
    
    print(f"[+] Success! {len(rewritten_jobs)} jobs rewritten and saved to rewritten_jobs.json")

if __name__ == "__main__":
    process_all_jobs()
