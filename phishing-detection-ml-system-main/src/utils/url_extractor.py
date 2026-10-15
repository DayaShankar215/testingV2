import re

URL_PATTERN = re.compile(
    r'(https?://[^\s]+|www\.[^\s]+|\b(?:[a-zA-Z][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(?:/[^\s]*)?)',
    re.IGNORECASE
)


def extract_urls(text):
    if not text:
        return []

    text = re.sub(r'\[.*?\]\((https?://.*?)\)', r'\1', text)

    urls = URL_PATTERN.findall(text)

    cleaned = []

    for url in urls:
        url = url.strip("()[]<>{},!?\"'")

        url = url.rstrip(".")

        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        cleaned.append(url)

    return list(dict.fromkeys(cleaned))
