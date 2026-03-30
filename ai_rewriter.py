import requests
import json
import os
import time
import html
from datetime import datetime

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
AUTO_BLOG_TAGS = "auto-draft,veille,emploi,maroc"

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


def _normalize_inline_text(value):
    return " ".join(str(value or "").split()).strip()


def _has_meaningful_text(value):
    normalized = _normalize_inline_text(value)
    return normalized and normalized.upper() not in {"N/A", "NA", "NONE", "NULL", "-"}


def _prepare_blog_jobs(jobs, limit=8):
    prepared = []
    for job in jobs[:limit]:
        prepared.append(
            {
                "title_ar": _normalize_inline_text(job.get("title", "")),
                "title_fr": _normalize_inline_text(
                    job.get("title_fr") or job.get("title", "")
                ),
                "organization_ar": _normalize_inline_text(job.get("organization", "")),
                "organization_fr": _normalize_inline_text(
                    job.get("organization_fr") or job.get("organization", "")
                ),
                "deadline": _normalize_inline_text(job.get("deadline", "")),
                "posts": _normalize_inline_text(job.get("posts", "")),
                "summary": _normalize_inline_text(job.get("meta_description", "")),
                "job_url": _normalize_inline_text(job.get("post_url") or job.get("url")),
                "source_url": _normalize_inline_text(job.get("url", "")),
            }
        )
    return prepared


def _build_job_list_html(jobs, lang):
    items = []
    for job in jobs:
        title = job["title_ar"] if lang == "ar" else job["title_fr"]
        organization = job["organization_ar"] if lang == "ar" else job["organization_fr"]
        summary = job["summary"]
        deadline = job["deadline"] if _has_meaningful_text(job["deadline"]) else ""
        posts = job["posts"] if _has_meaningful_text(job["posts"]) else ""
        link = job["job_url"] or job["source_url"]

        details = []
        if organization:
            details.append(html.escape(organization))
        if posts:
            details.append(html.escape(posts))
        if deadline:
            details.append(
                html.escape(f"{'آخر أجل' if lang == 'ar' else 'Date limite'}: {deadline}")
            )

        detail_line = " - ".join(details)
        summary_html = f"<p>{html.escape(summary)}</p>" if summary else ""
        link_label = "عرض التفاصيل" if lang == "ar" else "Voir l'offre"
        link_html = (
            f' <a href="{html.escape(link)}" target="_blank" rel="noopener noreferrer">{link_label}</a>'
            if link
            else ""
        )
        item = f"<li><strong>{html.escape(title)}</strong>"
        if detail_line:
            item += f"<div>{detail_line}</div>"
        item += f"{summary_html}{link_html}</li>"
        items.append(item)

    return "<ul>" + "".join(items) + "</ul>"


def _build_fallback_blog_draft(jobs, publish_date):
    prepared_jobs = _prepare_blog_jobs(jobs)
    display_date = datetime.strptime(publish_date, "%Y-%m-%d").strftime("%d/%m/%Y")
    hidden_count = max(0, len(jobs) - len(prepared_jobs))

    ar_intro = (
        f"تم خلال {display_date} رصد {len(jobs)} فرص جديدة في مجالات مختلفة داخل المغرب. "
        "في هذا المقال نستعرض أبرز الإعلانات المتاحة مع أهم المعطيات التي يحتاجها المترشح قبل متابعة الإعلان الرسمي."
    )
    fr_intro = (
        f"Le {display_date}, {len(jobs)} nouvelles opportunites ont ete reperees au Maroc dans plusieurs secteurs. "
        "Cet article presente les annonces les plus marquantes avec les informations essentielles a verifier avant de consulter la source officielle."
    )

    ar_more = (
        f"<p>هناك ايضا {hidden_count} فرص اضافية في هذا التحديث يمكن اضافتها يدويا اذا رغبت.</p>"
        if hidden_count
        else ""
    )
    fr_more = (
        f"<p>Il existe aussi {hidden_count} offres supplementaires dans cette vague que vous pouvez ajouter manuellement si besoin.</p>"
        if hidden_count
        else ""
    )

    ar_content = (
        f"<p>{html.escape(ar_intro)}</p>"
        "<h2>تفاصيل أبرز الفرص الجديدة</h2>"
        f"{_build_job_list_html(prepared_jobs, 'ar')}"
        "<h2>شروط المشاركة وطريقة التقديم</h2>"
        "<p>تختلف شروط المشاركة من إعلان إلى آخر حسب الجهة المنظمة وطبيعة المنصب أو المباراة. لذلك من المهم قراءة الإعلان الرسمي بعناية للتأكد من الشهادة المطلوبة، السن إن وجد، الوثائق المطلوبة، وآخر أجل لإيداع الملف.</p>"
        "<ul>"
        "<li>تحقق من شروط الترشيح كاملة في المصدر الرسمي قبل تجهيز الملف.</li>"
        "<li>راجع آخر أجل للتقديم والوثائق المطلوبة قبل إرسال الطلب.</li>"
        "<li>اعتمد فقط على الرابط الرسمي المرفق مع كل إعلان لتفادي أي معطيات ناقصة أو غير محدثة.</li>"
        "</ul>"
        "<h2>ملاحظات مهمة للمرشحين</h2>"
        "<p>قد تحتوي بعض الإعلانات على تفاصيل إضافية مرتبطة بمراكز التعيين أو نوع المباراة أو مراحل الانتقاء. لهذا السبب يبقى الرجوع إلى الإعلان الرسمي هو الخطوة الأهم قبل أي تقديم فعلي.</p>"
        f"{ar_more}"
        "<h2>خلاصة</h2>"
        "<p>تمثل هذه الفرص خيارات مهمة للباحثين عن العمل بالمغرب، سواء في القطاع العام أو الخاص. للحصول على جميع التفاصيل النهائية، يرجى الرجوع إلى الروابط الرسمية المرفقة داخل كل إعلان.</p>"
    )

    fr_content = (
        f"<p>{html.escape(fr_intro)}</p>"
        "<h2>Details des opportunites a suivre</h2>"
        f"{_build_job_list_html(prepared_jobs, 'fr')}"
        "<h2>Conditions de participation et candidature</h2>"
        "<p>Les conditions de participation varient selon l'organisme recruteur et la nature du poste ou du concours. Il est donc important de verifier dans l'annonce officielle le diplome demande, les pieces a fournir, les eventuelles limites d'age et la date limite de candidature.</p>"
        "<ul>"
        "<li>Consultez toujours la source officielle pour verifier les conditions completes.</li>"
        "<li>Preparez le dossier de candidature en tenant compte de la date limite annoncee.</li>"
        "<li>Utilisez uniquement le lien officiel associe a chaque offre pour postuler ou lire les details complets.</li>"
        "</ul>"
        "<h2>Informations utiles avant de postuler</h2>"
        "<p>Certaines annonces peuvent comporter des precisions sur les centres d'affectation, les etapes de selection ou les modalites de depot du dossier. Pour cette raison, la consultation de l'annonce officielle reste indispensable avant toute candidature.</p>"
        f"{fr_more}"
        "<h2>Conclusion</h2>"
        "<p>Ces nouvelles opportunites peuvent interesser plusieurs profils au Maroc. Avant de finaliser votre candidature, prenez le temps de consulter l'annonce officielle afin de verifier l'ensemble des conditions et des demarches.</p>"
    )

    return {
        "date": publish_date,
        "tags": AUTO_BLOG_TAGS,
        "title_ar": f"فرص عمل جديدة في المغرب - {display_date}",
        "title_fr": f"Nouvelles offres d'emploi au Maroc - {display_date}",
        "excerpt_ar": f"ملخص يومي لأهم فرص العمل والمسابقات الجديدة المضافة بتاريخ {display_date}.",
        "excerpt_fr": f"Resume quotidien des principales offres et concours ajoutes le {display_date}.",
        "content_ar": ar_content,
        "content_fr": fr_content,
    }


def generate_blog_draft(keys, jobs, publish_date=None):
    if not jobs:
        return None

    publish_date = publish_date or datetime.utcnow().strftime("%Y-%m-%d")
    prepared_jobs = _prepare_blog_jobs(jobs)
    fallback = _build_fallback_blog_draft(jobs, publish_date)

    if not keys:
        return fallback

    prompt = f"""You are an expert SEO content writer specialized in employment, recruitment, and competition articles in Morocco.

Your task is to transform one or more job offers or competition announcements into a high-quality bilingual SEO article in Arabic and French.

The final result must look like a real professional blog article written for human readers in Morocco.

INPUT DATA
You will receive structured information about the opportunities, such as:
- organization
- title
- number of posts
- deadline
- official source URL
- short description

You must use only the provided information.
Never invent facts.

IMPORTANT RULES

1. OUTPUT FORMAT

Return ONLY one valid JSON object.
Do not add explanations, comments, Markdown, or any text outside the JSON.

Use exactly this structure:

{{
  "title_ar": "...",
  "title_fr": "...",
  "excerpt_ar": "...",
  "excerpt_fr": "...",
  "content_ar": "<p>...</p>",
  "content_fr": "<p>...</p>",
  "tags": "tag1,tag2,tag3"
}}

2. HTML FORMAT

Generate clean, valid HTML only inside content_ar and content_fr.

Allowed tags only:
<p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>

Rules:
- All tags must be properly closed.
- Do not use Markdown.
- Do not use <div>, <style>, <script>, <table>, inline CSS, or HTML comments.
- Do not output broken HTML.
- Links must be valid and readable.

3. ARTICLE GOAL

Create a real article that is:
- useful
- natural
- informative
- SEO-friendly
- easy to read
- professionally written

The article must be unique and rewritten in an original way.
Do not copy the source text literally.
Do not produce robotic or generic AI-style content.

4. ARTICLE STRUCTURE

Each language version must follow a real article structure.

Include, when possible:
- A strong and clear title
- A natural introduction
- A section with the main details of the opportunities
- A section about participation requirements or eligibility
- A section explaining how to apply
- A short conclusion encouraging the reader to check the official source

Use:
- <h2> for main sections
- <h3> for useful subsections when needed
- <ul> and <li> for conditions, requirements, documents, or steps

5. REQUIRED SECTIONS

The article should usually contain sections similar to:
- Introduction
- Details of the opportunities
- Conditions de participation / شروط المشاركة
- How to apply / طريقة التقديم
- Important notes
- Conclusion

If the source is about a competition, adapt the wording to concours/recrutement public.
If it is a normal job offer, adapt the wording to emploi/offre d'emploi/recrutement.

6. FACTUAL ACCURACY

Never invent:
- dates
- salaries
- number of positions
- diploma requirements
- age conditions
- application procedures
- documents required
- deadlines

If some information is missing, keep the article useful but write cautiously.

Use safe formulations such as:

French:
"Veuillez consulter l'annonce officielle pour les conditions completes."
"Les details complets de candidature sont disponibles dans la source officielle."

Arabic:
"يرجى الرجوع إلى الإعلان الرسمي للاطلاع على جميع الشروط والتفاصيل."
"يمكن مراجعة المصدر الرسمي لمعرفة شروط الترشح وطريقة التقديم كاملة."

7. OFFICIAL LINK

In the application section, include the official source URL provided in the input.

Use a natural HTML link such as:

French:
<a href="SOURCE_URL">Consulter l'annonce officielle</a>

Arabic:
<a href="SOURCE_URL">الاطلاع على الإعلان الرسمي</a>

Rules:
- Always use the official source URL from the input.
- Never invent, shorten, or replace the URL.
- The link must be integrated naturally into the article.

8. CONTENT LENGTH

If the source contains enough details:
- Generate approximately 600 to 800 words per language.

If the source is limited:
- Generate a shorter article, but it must still remain clean, useful, structured, and natural.

Do not artificially inflate the text.
Do not repeat the same idea just to increase length.

9. WRITING STYLE

Arabic version:
- modern
- natural
- professional
- fluent
- not machine-translated

French version:
- natural
- professional
- human
- fluid
- as if written by a native French editor

The Arabic and French versions must both feel fully written, not mechanically translated from one another.

10. SEO OPTIMIZATION

Optimize the article naturally for SEO without keyword stuffing.

Relevant terms may appear naturally depending on context, such as:
- concours
- recrutement
- emploi
- Maroc
- candidature
- offre d'emploi
- fonction publique
- secteur public
- secteur prive

SEO must remain natural and useful for the reader.

11. CONTENT QUALITY

The article must look like a real published article.

Do NOT mention:
- AI
- prompt
- draft
- generated content
- internal notes
- automation
- system instructions

12. TITLES

Generate:
- one Arabic title
- one French title

Rules:
- attractive but factual
- clear
- SEO-friendly
- not clickbait
- based only on the provided information

13. EXCERPTS

Generate one excerpt in Arabic and one in French.

Rules:
- around 25 to 40 words each when possible
- informative
- natural
- suitable for previews, cards, and SEO snippets

14. TAGS

Generate 3 to 6 relevant SEO tags.

Rules:
- return them as one comma-separated plain string
- no hashtags
- short and relevant

15. MISSING INFORMATION RULE

If some sections cannot be fully completed because the source is incomplete:
- keep the structure of the article
- write a cautious and useful sentence
- never fabricate details

16. FINAL INSTRUCTION

Return ONLY the final JSON object.
No Markdown.
No explanations.
No code block.
No extra text.

Publish date: {publish_date}
Opportunities context:
{json.dumps(prepared_jobs, ensure_ascii=False)}"""

    result = ask_ai_json(keys, prompt)
    if not result:
        return fallback

    draft = {
        "date": publish_date,
        "tags": _normalize_inline_text(result.get("tags", "")) or AUTO_BLOG_TAGS,
        "title_ar": _normalize_inline_text(result.get("title_ar", "")),
        "title_fr": _normalize_inline_text(result.get("title_fr", "")),
        "excerpt_ar": _normalize_inline_text(result.get("excerpt_ar", "")),
        "excerpt_fr": _normalize_inline_text(result.get("excerpt_fr", "")),
        "content_ar": str(result.get("content_ar", "")).strip(),
        "content_fr": str(result.get("content_fr", "")).strip(),
    }

    required = ["title_ar", "title_fr", "excerpt_ar", "excerpt_fr", "content_ar", "content_fr"]
    if any(not draft[key] for key in required):
        return fallback

    return draft

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
