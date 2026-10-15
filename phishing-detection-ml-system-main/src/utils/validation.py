from urllib.parse import urlparse


def is_valid_url(url):

    if not isinstance(url, str):
        return False

    url = url.strip()

    if not url:
        return False

    parsed = urlparse(url)

    return bool(parsed.scheme and parsed.netloc)
