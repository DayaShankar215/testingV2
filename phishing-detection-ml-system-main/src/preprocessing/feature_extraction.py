from urllib.parse import urljoin, urlparse
import socket
import ssl
from datetime import datetime, timezone
import re
import ipaddress
import requests
import dns.resolver
import whois
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import time
import whois

whois_cache = {}
page_cache = {}
dns_cache = {}

def normalize_url(url):
    url = url.strip()

    if not url:
        raise ValueError("URL cannot be empty")

    if url.startswith(("http://", "https://")):
        return url

    https_url = "https://" + url

    try:
        requests.get(
            https_url,
            timeout=5,
            allow_redirects=False
        )
        return https_url
    except requests.RequestException:
        pass

    http_url = "http://" + url

    try:
        requests.get(
            http_url,
            timeout=5,
            allow_redirects=False
        )
        return http_url
    except requests.RequestException:
        return https_url

def get_whois_data(url):

    hostname = urlparse(url).hostname

    if hostname in whois_cache:
        return whois_cache[hostname]

    try:
        data = whois.whois(hostname)

        whois_cache[hostname] = data

        return data

    except Exception:
        return None


def having_ip_address(url):
    try:
        hostname = urlparse(url).hostname
        ipaddress.ip_address(hostname)
        return 0
    except Exception:
        return 1


def url_length(url):
    length = len(url)

    if length < 54:
        return 1
    elif length <= 75:
        return 0.5
    else:
        return 0


SHORTENERS = [
    "bit.ly", "goo.gl", "shorte.st", "go2l.ink", "x.co",
    "ow.ly", "t.co", "tinyurl.com", "tr.im", "is.gd",
    "cli.gs", "yfrog.com", "migre.me", "ff.im", "tiny.cc",
    "url4.eu", "twit.ac", "su.pr", "twurl.nl", "snipurl.com",
    "short.to", "budurl.com", "ping.fm", "post.ly", "just.as",
    "bkite.com", "snipr.com", "fic.kr", "loopt.us", "doiop.com",
    "short.ie", "kl.am", "wp.me", "rubyurl.com", "om.ly",
    "to.ly", "bit.do", "lnkd.in", "db.tt", "qr.ae",
    "adf.ly", "bitly.com", "cur.lv", "ity.im", "q.gs",
    "po.st", "bc.vc", "u.to", "j.mp", "buzurl.com"
]


def shortening_service(url):
    hostname = urlparse(url).hostname

    if hostname is None:
        return 1

    hostname = hostname.lower()

    for service in SHORTENERS:
        if hostname == service or hostname.endswith("." + service):
            return 0

    return 1


def having_at_symbol(url):
    if "@" in url:
        return 0

    return 1


def double_slash_redirecting(url):
    pos = url.rfind("//")

    if pos > 7:
        return 0

    return 1


def prefix_suffix(url):
    hostname = urlparse(url).hostname

    if hostname and "-" in hostname:
        return 0

    return 1


def having_sub_domain(url):
    hostname = urlparse(url).hostname

    if hostname is None:
        return 0

    dots = hostname.count(".")

    if dots == 1:
        return 1
    elif dots == 2:
        return 0.5
    else:
        return 0


def https_token(url):
    hostname = urlparse(url).hostname

    if hostname and "https" in hostname.replace(".", "").lower():
        return 0

    return 1


def port(url):
    parsed = urlparse(url)

    if parsed.port is None:
        return 1

    if parsed.port in [80, 443]:
        return 1

    return 0


def redirect_feature(url):
    try:
        response = requests.get(url, timeout=5)

        redirects = len(response.history)

        if redirects <= 1:
            return 1
        elif redirects <= 3:
            return 0.5
        else:
            return 0

    except Exception:
        return 0


def dns_record(url):

    hostname = urlparse(url).hostname

    if not hostname:
        return 0

    hostname = hostname.lower()

    if hostname in dns_cache:
        return dns_cache[hostname]

    record_types = ["A", "AAAA"]

    for record_type in record_types:

        try:

            dns.resolver.resolve(
                hostname,
                record_type,
                lifetime=3
            )

            dns_cache[hostname] = 1

            return 1

        except Exception:
            continue

    dns_cache[hostname] = 0

    return 0


def age_of_domain(url):

    try:

        domain = get_whois_data(url)

        if domain is None:
            return 0

        creation_date = domain.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date is None:
            return 0

        if creation_date.tzinfo is None:
            creation_date = creation_date.replace(
                tzinfo=timezone.utc
            )

        now = datetime.now(timezone.utc)

        age_days = (now - creation_date).days

        if age_days >= 180:
            return 1

        return 0

    except Exception as e:

        print("Age of domain error:", e)

        return 0


def domain_registration_length(url):

    try:

        domain = get_whois_data(url)

        if domain is None:
            return 0

        expiration_date = domain.expiration_date

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        if expiration_date is None:
            return 0

        if expiration_date.tzinfo is None:
            expiration_date = expiration_date.replace(
                tzinfo=timezone.utc
            )

        now = datetime.now(timezone.utc)

        remaining_days = (
            expiration_date - now
        ).days

        if remaining_days > 365:
            return 1

        return 0

    except Exception as e:

        print(
            "Domain registration length error:",
            e
        )

        return 0


def ssl_final_state(url):

    try:

        parsed = urlparse(url)

        if parsed.scheme.lower() != "https":
            return 0

        hostname = parsed.hostname

        if not hostname:
            return 0

        context = ssl.create_default_context()

        with socket.create_connection(
            (hostname, 443),
            timeout=8
        ) as sock:

            with context.wrap_socket(
                sock,
                server_hostname=hostname
            ) as ssock:

                cert = ssock.getpeercert()

                if not cert:
                    return 0

                not_after = cert.get("notAfter")

                if not not_after:
                    return 0

                expiration = datetime.strptime(
                    not_after,
                    "%b %d %H:%M:%S %Y %Z"
                )

                expiration = expiration.replace(
                    tzinfo=timezone.utc
                )

                now = datetime.now(timezone.utc)

                if expiration > now:
                    return 1

                return 0

    except Exception as e:

        print("SSL ERROR:", e)

        return 0


def fetch_page(url):
    """
    Fetch webpage with retries and browser-like headers.
    Returns HTML or None if the page cannot be retrieved.
    """

    if url in page_cache:
        return page_cache[url]

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/151.0.0.0 Safari/537.36"
        ),
        "Accept": (
            "text/html,application/xhtml+xml,"
            "application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    }

    for attempt in range(2):

        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=8,
                allow_redirects=True,
                verify=True
            )

            if response.status_code >= 200 and response.status_code < 400:

                content_type = response.headers.get(
                    "Content-Type",
                    ""
                ).lower()

                if "text/html" in content_type or not content_type:

                    html = response.text

                    page_cache[url] = html

                    return html

            print(
                f"Page request failed (attempt {attempt + 1}): "
                f"HTTP {response.status_code}"
            )

        except requests.RequestException as e:

            print(
                f"Page request failed (attempt {attempt + 1}): {e}"
            )

        if attempt == 0:
            time.sleep(1)

    page_cache[url] = None

    return None


def favicon(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        icon = soup.find("link", rel=lambda x: x and "icon" in x.lower())

        if not icon:
            return 1

        href = icon.get("href", "")

        hostname = urlparse(url).hostname

        if hostname in href or href.startswith("/"):
            return 1

        return 0

    except Exception:
        return 0


def submitting_to_email(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        html = html.lower()

        if "mailto:" in html or "mail(" in html:
            return 0

        return 1

    except Exception:
        return 0


def right_click(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        html = html.lower()

        suspicious_patterns = [
            "contextmenu",
            "event.button==2",
            "event.button == 2",
        ]

        for pattern in suspicious_patterns:
            if pattern in html:
                return 0

        return 1

    except Exception:
        return 0

 # TODO


def iframe(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        frames = soup.find_all("iframe")

        if len(frames) > 0:
            return 0

        return 1

    except Exception:
        return 0


def on_mouseover(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        html = html.lower()

        if "onmouseover" in html and "window.status" in html:
            return 0

        return 1

    except Exception:
        return 0


def request_url(url):
    try:
        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        hostname = urlparse(url).hostname
        hostname = hostname.lower().replace("www.", "")

        resources = []

        resources.extend(soup.find_all("img"))
        resources.extend(soup.find_all("audio"))
        resources.extend(soup.find_all("embed"))
        resources.extend(soup.find_all("iframe"))
        resources.extend(soup.find_all("script"))
        resources.extend(soup.find_all("source"))
        resources.extend(soup.find_all("video"))

        total = 0
        external = 0

        for tag in resources:

            src = tag.get("src")

            if not src:
                continue

            src = src.strip()

            if src.startswith("data:"):
                continue

            full_url = urljoin(url, src)

            parsed = urlparse(full_url)

            if parsed.hostname is None:
                total += 1
                continue

            total += 1

            resource_host = parsed.hostname.lower().replace("www.", "")

            if resource_host != hostname:
                external += 1

        if total == 0:
            return 1

        percentage = (external / total) * 100

        if percentage < 22:
            return 1
        elif percentage <= 61:
            return 0.5
        else:
            return 0

    except Exception:
        return 0


def url_of_anchor(url):

    try:

        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        hostname = (
            urlparse(url)
            .hostname
            .lower()
            .replace("www.", "")
        )

        anchors = soup.find_all("a")

        if len(anchors) == 0:
            return 1

        suspicious = 0

        trusted_domains = [
            hostname,
            "gstatic.com",
            "googleusercontent.com",
            "googleapis.com",
            "cloudflare.com",
            "cloudflareinsights.com",
        ]

        for anchor in anchors:

            href = anchor.get("href")

            if not href:
                suspicious += 1
                continue

            href = href.strip()

            if href == "":
                suspicious += 1
                continue

            if href.startswith("#"):
                suspicious += 1
                continue

            if href.lower().startswith("javascript"):
                suspicious += 1
                continue

            full_url = urljoin(url, href)

            parsed = urlparse(full_url)

            if parsed.hostname is None:
                continue

            link_host = (
                parsed.hostname
                .lower()
                .replace("www.", "")
            )

            internal = any(
                link_host == domain
                or link_host.endswith("." + domain)
                for domain in trusted_domains
            )

            if not internal:
                suspicious += 1

        percentage = suspicious / len(anchors) * 100

        if percentage < 31:
            return 1
        elif percentage <= 67:
            return 0.5
        else:
            return 0

    except Exception:
        return 0


def links_in_tags(url):

    try:

        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        hostname = (
            urlparse(url)
            .hostname
            .lower()
            .replace("www.", "")
        )

        tags = []

        tags.extend(soup.find_all("script"))
        tags.extend(soup.find_all("link"))
        tags.extend(soup.find_all("meta"))

        total = 0
        external = 0

        trusted_domains = [
            hostname,
            "googleapis.com",
            "gstatic.com",
            "cloudflare.com",
            "cloudflareinsights.com",
            "jsdelivr.net",
            "bootstrapcdn.com",
            "cdnjs.cloudflare.com",
            "unpkg.com",
        ]

        for tag in tags:

            link = tag.get("src") or tag.get("href") or tag.get("content")

            if not link:
                continue

            total += 1

            full_url = urljoin(url, link)

            parsed = urlparse(full_url)

            if parsed.hostname is None:
                continue

            link_host = (
                parsed.hostname
                .lower()
                .replace("www.", "")
            )

            internal = any(
                link_host == domain
                or link_host.endswith("." + domain)
                for domain in trusted_domains
            )

            if not internal:
                external += 1

        if total == 0:
            return 1

        percentage = (external / total) * 100

        if percentage < 17:
            return 1
        elif percentage <= 81:
            return 0.5
        else:
            return 0

    except Exception:
        return 0


def sfh(url):

    try:

        html = fetch_page(url)

        if html is None:
            return 0

        soup = BeautifulSoup(html, "html.parser")

        forms = soup.find_all("form")

        if len(forms) == 0:
            return 1

        hostname = (
            urlparse(url)
            .hostname
            .lower()
            .replace("www.", "")
        )

        suspicious = 0

        for form in forms:

            action = form.get("action")

            if action is None:
                suspicious += 1
                continue

            action = action.strip()

            if action == "" or action.lower() == "about:blank":
                suspicious += 1
                continue

            if action.lower().startswith("javascript"):
                suspicious += 1
                continue

            full_url = urljoin(url, action)

            parsed = urlparse(full_url)

            if parsed.hostname is None:
                continue

            form_host = (
                parsed.hostname
                .lower()
                .replace("www.", "")
            )

            if (
                form_host != hostname
                and not form_host.endswith("." + hostname)
            ):
                suspicious += 1

        percentage = suspicious / len(forms) * 100

        if percentage == 0:
            return 1
        elif percentage < 50:
            return 0.5
        else:
            return 0

    except Exception:
        return 0


def abnormal_url(url):

    try:

        hostname = (
            urlparse(url)
            .hostname
            .lower()
            .replace("www.", "")
        )

        domain = get_whois_data(url)

        if domain is None:
            return 0

        registered = domain.domain_name

        if not registered:
            return 0

        if isinstance(registered, list):
            registered = registered[0]

        registered = (
            registered
            .lower()
            .replace("www.", "")
        )

        if hostname == registered:
            return 1

        if hostname.endswith("." + registered):
            return 1

        return 0

    except Exception:
        return 0


def popup_window(url):

    try:

        html = fetch_page(url)

        if html is None:
            return 0

        html = html.lower()

        suspicious_patterns = [

            "window.open(",
            "alert(",
            "confirm(",
            "prompt("

        ]

        for pattern in suspicious_patterns:

            if pattern in html:
                return 0

        return 1

    except Exception:
        return 0


def web_traffic(url):
    return 0.5


def page_rank(url):
    return 0.5


def google_index(url):
    return 0.5


def links_pointing_to_page(url):
    return 0.5


def statistical_report(url):
    return 0.5


def extract_url_features(url):
    
    url = normalize_url(url)

    feature_functions = {

        "having_IP_Address": having_ip_address,
        "URL_Length": url_length,
        "Shortining_Service": shortening_service,
        "having_At_Symbol": having_at_symbol,
        "double_slash_redirecting": double_slash_redirecting,
        "Prefix_Suffix": prefix_suffix,
        "having_Sub_Domain": having_sub_domain,
        "HTTPS_token": https_token,
        "port": port,

        "Redirect": redirect_feature,
        "DNSRecord": dns_record,

        "age_of_domain": age_of_domain,
        "Domain_registeration_length": domain_registration_length,

        "SSLfinal_State": ssl_final_state,

        "Favicon": favicon,
        "Submitting_to_email": submitting_to_email,
        "RightClick": right_click,
        "Iframe": iframe,
        "on_mouseover": on_mouseover,

        "Request_URL": request_url,
        "URL_of_Anchor": url_of_anchor,
        "Links_in_tags": links_in_tags,
        "SFH": sfh,

        "Abnormal_URL": abnormal_url,
        "popUpWidnow": popup_window,

        "web_traffic": web_traffic,
        "Page_Rank": page_rank,
        "Google_Index": google_index,
        "Links_pointing_to_page": links_pointing_to_page,
        "Statistical_report": statistical_report
    }

    start = time.perf_counter()

    with ThreadPoolExecutor(max_workers=20) as executor:

        results = list(
            executor.map(
                lambda func: func(url),
                feature_functions.values()
            )
        )

    features = dict(
        zip(
            feature_functions.keys(),
            results
        )
    )

    total_time = time.perf_counter() - start

    print(
        "TOTAL FEATURE EXTRACTION:",
        round(total_time, 4),
        "seconds"
    )

    return features

if __name__ == "__main__":
    url = "binita.com"

    features = extract_url_features(url)

    print("\n========== binita.com==========")

    for name, value in features.items():
        print(f"{name}: {value}")

    print("===================================")