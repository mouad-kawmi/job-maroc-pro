import requests
from bs4 import BeautifulSoup
import json
import time
import re
import warnings
from urllib.parse import urljoin, urlparse
from urllib3.exceptions import InsecureRequestWarning

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/91.0.4472.124 Safari/537.36"
    )
}
INSECURE_FALLBACK_HOSTS = ("oncf.ma", "onda.ma")
ONCF_RECRUITMENT_URL = "https://www.oncf.ma/fr/Entreprise/Faire-carriere-a-l-oncf/Recrutement"
ONCF_ORGANIZATION = "Office National des Chemins de Fer (ONCF)"
ONDA_ORGANIZATION = "Office National Des Aeroports (ONDA)"
ONDA_SOURCE_PAGES = [
    {
        "url": "https://www.onda.ma/Je-d%C3%A9couvre-ONDA/Ressources-humaines/Recrutement-2025",
        "label": "Recrutement 2025",
        "default_posts": "N/A",
    },
    {
        "url": "https://www.onda.ma/Je-d%C3%A9couvre-ONDA/Ressources-humaines/Op%C3%A9ration-de-recrutement-Pompiers-d%27A%C3%A9rodrome",
        "label": "Pompiers d'Aerodrome",
        "default_posts": "43 postes",
    },
]


def host_supports_insecure_fallback(hostname):
    return any(hostname.endswith(suffix) or suffix in hostname for suffix in INSECURE_FALLBACK_HOSTS)


def fetch_page(url, timeout=20, allow_insecure_fallback=False):
    try:
        response = requests.get(url, headers=DEFAULT_HEADERS, timeout=timeout)
    except requests.exceptions.SSLError:
        hostname = (urlparse(url).hostname or "").lower()
        if not allow_insecure_fallback or not host_supports_insecure_fallback(hostname):
            raise

        print(f"[!] SSL verification failed for {hostname}. Retrying with verify=False...")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", InsecureRequestWarning)
            response = requests.get(
                url,
                headers=DEFAULT_HEADERS,
                timeout=timeout,
                verify=False,
            )

    response.raise_for_status()
    response.encoding = response.apparent_encoding or "utf-8"
    return response

def get_job_details(url):
    try:
        parsed_url = urlparse(url)
        hostname = (parsed_url.hostname or "").lower()
        path_lower = parsed_url.path.lower()

        if path_lower.endswith(".pdf") or "/media/files/" in path_lower:
            return f"PDF officiel: {url}"

        response = fetch_page(
            url,
            timeout=15,
            allow_insecure_fallback=host_supports_insecure_fallback(hostname),
        )
        soup = BeautifulSoup(response.text, "html.parser")

        if "oncf.ma" in hostname:
            title_selectors = [
                "h1",
                ".block-slider-detail_title",
                ".block-page-detail_title",
                ".text-page_title",
                ".text-riche",
            ]
            title = ""
            for selector in title_selectors:
                node = soup.select_one(selector)
                if node:
                    title = node.get_text(" ", strip=True)
                    if title:
                        break

            date_node = soup.select_one(".ezdatetime-field")
            publication_date = date_node.get_text(" ", strip=True) if date_node else ""

            pdf_url = ""
            for link in soup.select('a[href]'):
                href = link.get("href", "")
                if ".pdf" in href.lower():
                    pdf_url = urljoin(url, href)
                    break

            summary_lines = ["Annonce officielle ONCF"]
            if title:
                summary_lines.append(f"Intitule: {title}")
            if publication_date:
                summary_lines.append(f"Date de publication: {publication_date}")
            if pdf_url:
                summary_lines.append(f"PDF officiel: {pdf_url}")

            return "\n".join(summary_lines)

        if "onda.ma" in hostname:
            title = ""
            for selector in ["h1", "title"]:
                node = soup.select_one(selector)
                if node:
                    title = node.get_text(" ", strip=True)
                    if title:
                        break
            if not title:
                title = "Annonce officielle ONDA"
            plain_text = soup.get_text("\n", strip=True)
            lowered_text = plain_text.lower()
            snippet = ""

            for marker, backtrack in [
                ("lance un concours pour le recrutement de", 0),
                ("affectation :", 220),
                ("le concours est ouvert aux candidats", 0),
                ("avis de relance", 0),
            ]:
                index = lowered_text.find(marker)
                if index != -1:
                    start = max(0, index - backtrack)
                    snippet = plain_text[start:start + 1800].strip()
                    break

            summary_lines = ["Annonce officielle ONDA", f"Intitule: {title}"]
            if snippet:
                summary_lines.append(snippet)

            return "\n".join(summary_lines)

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

    for page in range(1, max_pages + 1):
        url = f"{category_url}?page={page}" if page > 1 else category_url
        print(f"[*] Scanning {url}...")

        try:
            response = fetch_page(url, timeout=20)
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
    current_year = time.gmtime().tm_year

    try:
        response = fetch_page(url, timeout=20)
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


def clean_oncf_title(raw_title):
    title = re.sub(r'^\s*Avis de recrutement\s*:\s*', '', raw_title, flags=re.IGNORECASE)
    title = re.sub(r'\s+', ' ', title).strip(" -")
    return title or raw_title.strip()


def clean_onda_title(raw_title, source_label):
    title = re.sub(r'^[\.\-\s]+', '', raw_title or '').strip()

    if title.lower() == "avis de recrutement" and source_label:
        title = source_label
    elif source_label and title.lower().startswith("avis de relance"):
        title = f"{title} - {source_label}"

    title = re.sub(r'\s+', ' ', title).strip(" -")
    return title or source_label


def extract_onda_posts(raw_title, default_posts):
    text = raw_title or ""
    match = re.search(r'\((\d+)\s*postes?\)', text, re.IGNORECASE)
    if match:
        return f"{match.group(1)} postes"
    return default_posts


def is_onda_result_link(raw_title):
    lowered = (raw_title or "").casefold()
    excluded_keywords = [
        "liste des candidats",
        "candidats retenus",
        "resultat final",
        "epreuve orale",
        "epreuve ecrite",
    ]
    return any(keyword in lowered for keyword in excluded_keywords)


def scrape_onda_recruitment():
    print("[*] SCRAPING SOURCE: ONDA Recrutement...")
    jobs = []
    seen_urls = set()

    for source in ONDA_SOURCE_PAGES:
        try:
            response = fetch_page(
                source["url"],
                timeout=20,
                allow_insecure_fallback=True,
            )
            soup = BeautifulSoup(response.text, "html.parser")
        except Exception as e:
            print(f"[!] Error scraping ONDA page {source['url']}: {e}")
            continue

        for link in soup.find_all("a", href=True):
            raw_title = re.sub(r'\s+', ' ', link.get_text(" ", strip=True)).strip()
            if not raw_title or is_onda_result_link(raw_title):
                continue

            normalized_title = re.sub(r'^[\.\-\s]+', '', raw_title).strip()
            lowered = normalized_title.casefold()
            if lowered in {"recrutement", "recrutement 2025"}:
                continue

            include_link = lowered.startswith("avis de") or "postes" in lowered
            if not include_link:
                continue

            job_url = urljoin(source["url"], link["href"].strip())
            if job_url in seen_urls:
                continue

            title = clean_onda_title(normalized_title, source["label"])
            if not title:
                continue

            full_title = f"{title} - ONDA" if "onda" not in title.casefold() else title
            jobs.append(
                {
                    "organization": ONDA_ORGANIZATION,
                    "title": full_title,
                    "posts": extract_onda_posts(normalized_title, source["default_posts"]),
                    "deadline": "N/A",
                    "url": job_url,
                }
            )
            seen_urls.add(job_url)

    return jobs


def scrape_oncf_recruitment():
    print("[*] SCRAPING SOURCE: ONCF Recrutement...")
    try:
        response = fetch_page(
            ONCF_RECRUITMENT_URL,
            timeout=20,
            allow_insecure_fallback=True,
        )
        soup = BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"[!] Error scraping ONCF Recrutement: {e}")
        return []

    jobs = []
    cards = soup.select('div.block-offres-emploi_liste_item')

    for card in cards:
        try:
            title_node = card.select_one('h3.block-offres-emploi_liste_item_title')
            raw_title = title_node.get_text(" ", strip=True) if title_node else ""
            if not raw_title or not re.search(r'avis de recrutement', raw_title, re.IGNORECASE):
                continue

            detail_url = ""
            pdf_url = ""
            for link in card.select('.block-offres-emploi_liste_item_links a[href]'):
                href = urljoin(ONCF_RECRUITMENT_URL, link.get('href', '').strip())
                link_text = link.get_text(" ", strip=True).lower()
                if ".pdf" in href.lower() or "pdf" in link_text:
                    pdf_url = href
                elif not detail_url:
                    detail_url = href

            if not detail_url and not pdf_url:
                continue

            title = clean_oncf_title(raw_title)
            full_title = f"{title} - ONCF" if "oncf" not in title.lower() else title
            jobs.append(
                {
                    "organization": ONCF_ORGANIZATION,
                    "title": full_title,
                    "posts": "N/A",
                    "deadline": "N/A",
                    "url": detail_url or pdf_url,
                }
            )
        except Exception as exc:
            preview = card.get_text(" ", strip=True)[:120]
            print(f"[!] Skipping malformed ONCF card: {exc} | Preview: {preview}")
            continue

    return jobs

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

    # Scrape ONCF Recrutement
    oncf_jobs = scrape_oncf_recruitment()
    for j in oncf_jobs:
        if j['url'] not in seen_urls:
            total_jobs.append(j); seen_urls.add(j['url'])

    # Scrape ONDA Recrutement
    onda_jobs = scrape_onda_recruitment()
    for j in onda_jobs:
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
