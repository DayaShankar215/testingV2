feature_descriptions = {

    "having_IP_Address": {
        "positive": "The website address uses a normal domain name, which supports legitimacy.",
        "negative": "The website uses an IP address instead of a normal domain name, which can be a phishing warning sign."
    },

    "URL_Length": {
        "positive": "The web address has a normal length, which supports legitimacy.",
        "negative": "The unusually long web address increased phishing suspicion."
    },

    "Shortining_Service": {
        "positive": "The web address does not appear to use a URL shortening service.",
        "negative": "The web address uses a URL shortening service, which can hide the actual destination."
    },

    "having_At_Symbol": {
        "positive": "The web address does not contain a suspicious @ symbol.",
        "negative": "The web address contains an @ symbol, which can be used to disguise the actual destination."
    },

    "double_slash_redirecting": {
        "positive": "The web address does not show suspicious double-slash redirection.",
        "negative": "The web address contains a suspicious redirection pattern."
    },

    "Prefix_Suffix": {
        "positive": "The website address structure appears normal and supports legitimacy.",
        "negative": "The website address structure looks suspicious and increased phishing suspicion."
    },

    "having_Sub_Domain": {
        "positive": "The subdomain structure appears normal and supports legitimacy.",
        "negative": "The website uses multiple subdomains, which increased phishing suspicion."
    },

    "SSLfinal_State": {
        "positive": "The website's security certificate and HTTPS connection supported legitimacy.",
        "negative": "The website's security indicators increased phishing suspicion."
    },

    "Domain_registeration_length": {
        "positive": "The domain registration period appears consistent with an established website.",
        "negative": "The domain registration period increased phishing suspicion."
    },

    "Favicon": {
        "positive": "The website's favicon appears consistent with the website domain.",
        "negative": "The website's favicon or icon structure showed characteristics associated with phishing websites."
    },

    "port": {
        "positive": "The website uses a standard web port, which supports legitimacy.",
        "negative": "The website uses a non-standard port, which increased phishing suspicion."
    },

    "HTTPS_token": {
        "positive": "The domain does not contain a suspicious HTTPS-related token.",
        "negative": "The domain contains an HTTPS-related term that may be intended to make the address appear more trustworthy."
    },

    "Request_URL": {
        "positive": "The webpage's resource requests appear normal and support legitimacy.",
        "negative": "The webpage's resource requests showed patterns that increased phishing suspicion."
    },

    "URL_of_Anchor": {
        "positive": "The website's links appear consistent with legitimate websites.",
        "negative": "The website's links showed patterns commonly associated with phishing websites."
    },

    "Links_in_tags": {
        "positive": "The webpage's embedded links and resources appear normal.",
        "negative": "The webpage's embedded links and resources increased phishing suspicion."
    },

    "SFH": {
        "positive": "The way website forms handle submitted information appears trustworthy.",
        "negative": "The way website forms handle submitted information increased phishing suspicion."
    },

    "Submitting_to_email": {
        "positive": "The webpage does not appear to submit user information directly to an email address.",
        "negative": "The webpage appears to use email-based submission, which can be a phishing warning sign."
    },

    "Abnormal_URL": {
        "positive": "The website address appears consistent with its registered domain.",
        "negative": "The website address showed characteristics that were inconsistent with its registered domain."
    },

    "Redirect": {
        "positive": "The website's redirection behavior appears normal.",
        "negative": "The website's redirection behavior showed suspicious patterns."
    },

    "on_mouseover": {
        "positive": "The webpage does not show suspicious mouse-over behavior.",
        "negative": "The webpage contains suspicious mouse-over behavior that may be used to disguise links."
    },

    "RightClick": {
        "positive": "The webpage does not show suspicious right-click restrictions.",
        "negative": "The webpage contains behavior that restricts or interferes with normal right-click actions."
    },

    "popUpWidnow": {
        "positive": "The webpage does not show suspicious pop-up behavior.",
        "negative": "The webpage contains suspicious pop-up behavior that increased phishing suspicion."
    },

    "Iframe": {
        "positive": "The webpage does not contain suspicious embedded frames.",
        "negative": "The webpage uses embedded frames, which can sometimes be used to hide or imitate website content."
    },

    "age_of_domain": {
        "positive": "The domain age supports the appearance of an established website.",
        "negative": "The relatively new domain increased phishing suspicion."
    },

    "DNSRecord": {
        "positive": "The domain has a valid DNS record, supporting its legitimacy.",
        "negative": "The domain's DNS information could not be verified, which increased phishing suspicion."
    },

    "web_traffic": {
        "positive": "The website's traffic and popularity pattern supports legitimacy.",
        "negative": "The website has limited or unusual traffic characteristics, which increased phishing suspicion."
    },

    "Page_Rank": {
        "positive": "The website's online popularity and reputation support legitimacy.",
        "negative": "The website's low online popularity or reputation increased phishing suspicion."
    },

    "Google_Index": {
        "positive": "The website appears in search engine results, supporting its legitimacy.",
        "negative": "The website's search engine indexing characteristics increased phishing suspicion."
    },

    "Links_pointing_to_page": {
        "positive": "The pattern of external links pointing to the website appears consistent with legitimate websites.",
        "negative": "The website has few or no external links, which increased phishing suspicion."
    },

    "Statistical_report": {
        "positive": "Available security and reputation indicators do not show known phishing activity.",
        "negative": "Security and reputation indicators showed characteristics associated with phishing activity."
    }
}

