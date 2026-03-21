import requests
from bs4 import BeautifulSoup
import json
import time

def get_job_details(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for the main content container in the detail page
        main_content = soup.find('div', {'id': 'detail_concours'})
        if not main_content:
            main_content = soup.find('div', {'class': 'card'})
            
        return main_content.get_text(separator='\n', strip=True) if main_content else "No description available."
    except Exception as e:
        print(f"[-] Error fetching details for {url}: {e}")
        return ""

def scrape_emploi_public():
    url = "https://www.emploi-public.ma/ar/%D9%82%D8%A7%D8%A6%D9%85%D8%A9-%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    print(f"[*] Scanning {url}...")
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response.encoding = 'utf-8'
    except Exception as e:
        print(f"[!] Error fetching site: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    jobs = []
    cards = soup.select('a.card.card-scale')
    
    for card in cards:
        try:
            title_elem = card.find('h2')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            divs = card.find_all('div')
            
            org = "N/A"
            if len(divs) > 0:
                raw_org = divs[0].get_text(strip=True)
                org = raw_org.replace("الإعلان", "").replace("الايداع الالكتروني", "").strip()
            
            if title == "N/A" and len(divs) > 0:
                title = divs[0].get_text(strip=True)
                if len(divs) > 1:
                    org = divs[1].get_text(strip=True).replace("الإعلان", "").strip()

            deadline = "N/A"
            posts = "N/A"
            for d in divs:
                txt = d.get_text(strip=True)
                if "آخر أجل" in txt:
                    deadline = txt.replace("آخر أجل لإيداع ملفات الترشيح :", "").strip()
                    deadline = " ".join(deadline.split())
                elif "منصب" in txt:
                    posts = txt.strip()
            
            job_url = card['href']
            if not job_url.startswith('http'):
                job_url = "https://www.emploi-public.ma" + job_url

            if title in org:
                org = org.replace(title, "").strip()

            # --- DEEP SCRAPE: Get full text for Gemini ---
            print(f"[*] Fetching full details for: {title[:40]}...")
            full_content = get_job_details(job_url)
            
            job_data = {
                "organization": org,
                "title": title,
                "posts": posts,
                "deadline": deadline,
                "url": job_url,
                "full_description": full_content
            }
            jobs.append(job_data)
            
            # Politeness delay
            time.sleep(1)
            
        except Exception as e:
            print(f"[-] Error parsing a card: {e}")
            continue
                
    return jobs

if __name__ == "__main__":
    results = scrape_emploi_public()
    if results:
        print(f"[+] Found {len(results)} job offers.")
        # Save to a temporary JSON to see the result
        with open('latest_jobs.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        print("[*] Results saved to latest_jobs.json")
    else:
        print("[!] No jobs found. Check the scraping logic.")
