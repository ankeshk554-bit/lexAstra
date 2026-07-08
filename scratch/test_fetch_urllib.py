import urllib.request
import urllib.parse
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_section(sec_num):
    query = f"section {sec_num} \"partnership act, 1932\""
    url = f"https://indiankanoon.org/search/?formInput={urllib.parse.quote(query)}"
    print(f"Searching: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            # Find the first href="/doc/xxxx/" in <div class="result">
            # Simple regex search
            matches = re.findall(r'href="/doc/(\d+)/"', html)
            if matches:
                # The first match is usually the first result
                doc_url = f"https://indiankanoon.org/doc/{matches[0]}/"
                return doc_url
    except Exception as e:
        print(f"Error searching section {sec_num}: {e}")
    return None

def fetch_section_text(doc_url):
    print(f"Fetching doc: {doc_url}")
    try:
        req = urllib.request.Request(doc_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            # Extract content from <div class="judgtext">...</div>
            # Simple regex to get contents of all <div class="judgtext"> tags
            text_parts = []
            matches = re.findall(r'<div class="judgtext"[^>]*>(.*?)</div>', html, re.DOTALL)
            for match in matches:
                # Clean html tags from text
                clean = re.sub(r'<[^>]+>', '', match)
                # Unescape HTML entities
                clean = clean.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').replace('&apos;', "'").replace('&#39;', "'")
                text_parts.append(clean.strip())
            
            if not text_parts:
                # Fallback to general content
                match = re.search(r'<div class="docsource_main"[^>]*>(.*?)</div>', html, re.DOTALL)
                if match:
                    clean = re.sub(r'<[^>]+>', '', match.group(1))
                    text_parts.append(clean.replace('&nbsp;', ' ').strip())
            
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
