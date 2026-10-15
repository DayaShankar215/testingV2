from src.preprocessing.feature_extraction import extract_url_features
from src.utils.explanation import generate_explanation


def analyze_url(url):

    features = extract_url_features(url)

    result = generate_explanation(features)

    return result

