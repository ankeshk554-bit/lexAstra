import requests
from bs4 import BeautifulSoup
import re
import urllib.parse
import time

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_section(sec_num):
    query = f"section {sec_num} \"partnership act, 1932\""
    url = f"https://indiankanoon.org/search/?formInput={urllib.parse.quote(query)}"
    print(f"Searching: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Failed search with status code {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        # Find first search result
        result_divs = soup.find_all('div', class_='result')
        for div in result_divs:
            a_tag = div.find('a')
            if a_tag and a_tag.get('href'):
                href = a_tag['href']
                if href.startswith('/doc/'):
                    doc_id = href.split('/')[2]
                    doc_url = f"https://indiankanoon.org/doc/{doc_id}/"
                    return doc_url
    except Exception as e:
        print(f"Error searching section {sec_num}: {e}")
    return None

def fetch_section_text(doc_url):
    print(f"Fetching doc: {doc_url}")
    try:
        response = requests.get(doc_url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Failed doc fetch: {response.status_code}")
            return None
        soup = BeautifulSoup(response.text, 'html.parser')
        # Indian Kanoon puts the document text inside divs with class 'judgtext'
        judgtext_divs = soup.find_all('div', class_='judgtext')
        text_parts = []
        for div in judgtext_divs:
            # Get text and clean it
            text_parts.append(div.get_text(separator='\n').strip())
        
        # If no judgtext, try main document body text
        if not text_parts:
            body_div = soup.find('div', class_='docsource_main')
            if body_div:
                text_parts.append(body_div.get_text().strip())
        
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"Error fetching text: {e}")
    return None

doc_url = search_section(4)
if doc_url:
    text = fetch_section_text(doc_url)
    print("--- SECTION 4 TEXT ---")
    print(text)
else:
    print("Doc URL not found")
