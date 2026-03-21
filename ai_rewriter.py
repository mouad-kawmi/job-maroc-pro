from google import genai
import json
import os
import time

# --- CONFIGURE YOUR API KEY HERE ---
GEMINI_API_KEY = "AIzaSyBlx__WWRkCpR-o92WNOQZsmX3OCbrzuoo"

def setup_gemini():
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE" or not GEMINI_API_KEY:
        print("[!] ERROR: Please set your GEMINI_API_KEY in ai_rewriter.py")
        return None
    
    # New Client structure for google-genai
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        return client
    except Exception as e:
        print(f"[!] GEMINI Init Error: {e}")
        return None

def rewrite_job(client, job_data):
    prompt = f"""
    أنت خبير في التوظيف في المغرب بمهارات عالية في الـ SEO. 
    قم بكتابة تفاصيل التوظيف باللغتين العربية والفرنسية بناءً على هذه البيانات.
    
    المعلومات الخام:
    - المؤسسة: {job_data['organization']}
    - المسمى الوظيفي: {job_data['title']}
    - التفاصيل: {job_data.get('full_description', 'N/A')}
    - آخر أجل: {job_data['deadline']}
    - الرابط: {job_data['url']}
    
    المطلوب منك هو إرجاع النص بتنسيق JSON حصراً. لا تقم بإضافة أي تعليق خارج بنية الـ JSON. نص الاستجابة يجب أن يكون بالشكل التالي فقط:
    {{
      "title_fr": "ترجمة المسمى الوظيفي للفرنسية بشكل دقيق واحترافي",
      "organization_fr": "ترجمة اسم المؤسسة أو الوزارة للفرنسية",
      "content_html": "هنا ضع المحتوى الوصفي بالكامل بتنسيق Markdown. يجب أن يتضمن القسمين: الإعلان بالعربية متبوعاً بسطر فاصل '---' ثم الترجمة الفرنسية للمحتوى."
    }}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest", 
            contents=prompt
        )
        
        text = response.text.strip()
        # Parse JSON output securely
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"[!] Error with Gemini API or JSON parsing: {e}")
        return None

def process_all_jobs():
    client = setup_gemini()
    if not client:
        return

    try:
        with open('latest_jobs.json', 'r', encoding='utf-8') as f:
            jobs = json.load(f)
    except FileNotFoundError:
        print("[!] latest_jobs.json not found. Run scraper.py first.")
        return

    rewritten_jobs = []
    print(f"[*] Processing {len(jobs)} jobs with AI (New SDK)...")
    
    for i, job in enumerate(jobs):
        print(f"[*] Post {i+1}/{len(jobs)}: {job['title']}...")
        content = rewrite_job(client, job)
        if content:
            job['content_html'] = content
            rewritten_jobs.append(job)
        
        # Free Tier limit check
        time.sleep(4)
        
    with open('rewritten_jobs.json', 'w', encoding='utf-8') as f:
        json.dump(rewritten_jobs, f, ensure_ascii=False, indent=4)
    
    print(f"[+] Success! {len(rewritten_jobs)} jobs rewritten and saved to rewritten_jobs.json")

if __name__ == "__main__":
    process_all_jobs()
