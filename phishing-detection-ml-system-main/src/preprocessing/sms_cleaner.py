import re
import pandas as pd


def clean_message(message: str) -> str:

    if pd.isna(message):
        return ""

    message = str(message)

    abbreviations = {
        'u': 'you',
        'ur': 'your',
        'r': 'are',
        'y': 'why',
        'd': 'the',
        'b': 'be',
        'k': 'okay',
        'c': 'see',
        'n': 'and',
        'w': 'with',
        '2': 'to',
        '4': 'for',
        'b4': 'before',
        'bc': 'because',
        'cuz': 'because',
        'plz': 'please',
        'pls': 'please',
        'thx': 'thanks',
        'ty': 'thank you',
        'yw': 'you welcome',
        'lol': 'laughing out loud',
        'omg': 'oh my god',
        'btw': 'by the way',
        'imo': 'in my opinion',
        'idk': 'i do not know',
        'idc': 'i do not care',
        'tbh': 'to be honest',
        'nvm': 'never mind',
        'brb': 'be right back',
        'bbs': 'be back soon',
        'bbl': 'be back later',
        'gtg': 'got to go',
        'g2g': 'got to go',
        'cya': 'see you',
        'ttys': 'talk to you soon',
        'ttyl': 'talk to you later',
        'omw': 'on my way',
        'ily': 'i love you',
        'ilu': 'i love you',
        'luv': 'love',
        'msg': 'message',
        'txt': 'text',
        'fav': 'favorite',
        'sec': 'second',
        'mins': 'minutes',
        'hrs': 'hours',
        'ppl': 'people',
        'ya': 'you',
        'yall': 'you all',
        'l8r': 'later',
        'gr8': 'great',
        '2day': 'today',
        '2moro': 'tomorrow',
        '2nite': 'tonight',
        'w8': 'wait'
    }

    for short, full in sorted(abbreviations.items(), key=lambda x: len(x[0]), reverse=True):
        message = re.sub(
            r'\b' + re.escape(short) + r'\b',
            full,
            message,
            flags=re.IGNORECASE
        )

    message = re.sub(r'\s+([!?.])', r'\1', message)
    message = re.sub(r'([!?.])\s+', r'\1 ', message)

    message = re.sub(r'\s+', ' ', message).strip()

    message = re.sub(r'([!?.])\1+', r'\1', message)
    message = re.sub(r'\.{2,}', '.', message)

    message = message.lower()

    return message