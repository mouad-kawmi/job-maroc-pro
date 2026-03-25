import requests
from bs4 import BeautifulSoup
import json
import time
import re

def get_job_details(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # Emploi-Public details
        main_content = soup.find('div', {'id': 'detail_concours'})
        if not main_content:
            # Alwadifa-Maroc details often in a specific div or just the text
            main_content = soup.find('div', {'class': 'offre-content'}) or soup.find('div', {'id': 'offre-content'})
            if not main_content:
                main_content = soup.find('div', {'class': 'card'}) or soup.find('article')
            
        if main_content:
            return main_content.get_text(separator='\n', strip=True)
        return "No description available."
    except Exception as e:
        print(f"[-] Error fetching details for {url}: {e}")
        return ""

def scrape_emploi_public_list(category_url, max_pages=3):
    all_jobs = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    for page in range(1, max_pages + 1):
        url = f"{category_url}?page={page}" if page > 1 else category_url
        print(f"[*] Scanning {url}...")

        try:
            response = requests.get(url, headers=headers, timeout=20)
            response.raise_for_status()
            response.encoding = 'utf-8'
        except Exception as e:
            print(f"[!] Error fetching site (Page {page}): {e}")
            continue

        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.select('a.card.card-scale')

        for card in cards:
            try:
                title_elem = card.find('h2')
                full_title = title_elem.get_text(strip=True) if title_elem else "N/A"
                title = re.sub(r'\d+\s*أيام متبقية', '', full_title).replace('الإعلان', '').strip()
                if not title or title == "N/A":
                    continue

                divs = card.find_all('div')
                org, deadline, posts = "N/A", "N/A", "N/A"

                for d in divs:
                    text = d.get_text(strip=True)
                    if not text or text in ["جديد", "الإعلان", "الايداع الالكتروني", "نتيجة", "الاستدعاء"]: continue
                    if "أيام متبقية" in text: continue
                    if "آخر أجل" in text:
                        deadline = text.replace("آخر أجل لإيداع ملفات الترشيح :", "").strip()
                        deadline = " ".join(deadline.split())
                    elif ("منصب" in text or "مناصب" in text) and any(c.isdigit() for c in text):
                        match = re.search(r'(\d+)\s*(منصب|مناصب)', text)
                        if match: posts = f"{match.group(1)} {match.group(2)}"
                    elif org == "N/A" and len(text) > 5:
                        if text not in full_title: org = text

                if org == "N/A" and len(divs) > 1: org = divs[1].get_text(strip=True)
                org = org.split('\n')[0].replace('الإعلان', '').strip()

                job_url = card['href']
                if not job_url.startswith('http'): job_url = "https://www.emploi-public.ma" + job_url

                all_jobs.append({"organization": org, "title": title, "posts": posts, "deadline": deadline, "url": job_url})
            except Exception as exc:
                preview = card.get_text(" ", strip=True)[:120]
                print(f"[!] Skipping malformed Emploi-Public card: {exc} | Preview: {preview}")
                continue

    return all_jobs

def scrape_alwadifa_maroc():
    """Scrapes Alwadifa-Maroc.com homepage for latest offers"""
    print("[*] SCRAPING SOURCE: Alwadifa-Maroc...")
    url = "https://www.alwadifa-maroc.com/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    current_year = time.gmtime().tm_year

    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        links = soup.find_all('a', href=re.compile(r'/offre/show/id/\d+'))
        jobs = []
        for link in links:
            text = link.get_text(strip=True)
            if not text or len(text) < 10: continue

            # Skip results/lists if they are not actual "new" offers
            if any(k in text for k in ["النتائج النهائية", "لائحة المترشحين", "الاختبار الكتابي", "مرشحي", "برنامج شفوي"]):
                continue

            # Extract Organization (before :)
            org = "N/A"
            if ":" in text:
                org = text.split(":")[0].strip()
                title = text.split(":")[1].strip()
            else:
                title = text
                # Try common org patterns
                match_org = re.search(r'^(وزارة [^ ]+|إدارة [^ ]+|مجموعة [^ ]+|شركة [^ ]+)', text)
                if match_org: org = match_org.group(1)

            # Extract Posts
            posts = "N/A"
            match_posts = re.search(r'(\d+)\s*(منصب|مناصب)', text)
            if match_posts: posts = f"{match_posts.group(1)} {match_posts.group(2)}"

            # Extract Deadline
            deadline = "N/A"
            match_date = re.search(r'(\d+)\s+(يناير|فبراير|مارس|أبريل|ابريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|اكتوبر|نونبر|دجنبر)\s+(\d{4})', text)
            if match_date:
                year = int(match_date.group(3))
                if year < current_year:
                    continue  # Skip old expired jobs from "Most Viewed" section
                deadline = f"{match_date.group(1)} {match_date.group(2)} {match_date.group(3)}"
            else:
                mentioned_years = [int(year) for year in re.findall(r'\b(20\d{2})\b', text)]
                if mentioned_years and max(mentioned_years) < current_year:
                    continue  # Catch-all for older years without a full deadline match

            href = link['href']
            if not href.startswith('http'): href = "https://www.alwadifa-maroc.com" + href

            if org == "N/A" or title == "N/A":
                # Skip unstructured links (like ad links or simple text loops without context)
                continue

            jobs.append({"organization": org, "title": title, "posts": posts, "deadline": deadline, "url": href})

        return jobs
    except Exception as e:
        print(f"[!] Error scraping Alwadifa-Maroc: {e}")
        return []

def scrape_all_sources():
    # 1. Emploi-Public Sections
    emploi_sections = [
        {"name": "Concours", "url": "https://www.emploi-public.ma/ar/%D9%82%D8%A7%D8%A6%D9%85%D8%A9-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA", "pages": 5},
        {"name": "Responsibility", "url": "https://www.emploi-public.ma/ar/%D9%82%D8%A7%D8%A6%D9%85%D8%A9-%D9%85%D9%86%D8%A7%D8%B5%D8%A8-%D8%A7%D9%84%D9%85%D8%B3%D8%A4%D9%88%D9%84%D9%8A%D8%A9", "pages": 2},
    ]

    total_jobs = []
    seen_urls = set()

    # Scrape Emploi-Public
    for section in emploi_sections:
        jobs = scrape_emploi_public_list(section['url'], max_pages=section['pages'])
        for j in jobs:
            if j['url'] not in seen_urls:
                total_jobs.append(j); seen_urls.add(j['url'])

    # Scrape Alwadifa-Maroc
    al_jobs = scrape_alwadifa_maroc()
    for j in al_jobs:
        if j['url'] not in seen_urls:
            total_jobs.append(j); seen_urls.add(j['url'])

    print(f"\n[+] Total unique jobs found: {len(total_jobs)}")
    return total_jobs

if __name__ == "__main__":
    results = scrape_all_sources()
    print(f"Scraped {len(results)} jobs total.")
