from src.preprocessing.feature_extraction import extract_url_features
from src.utils.explanation import generate_explanation

url = "https://google.com"

features = extract_url_features(url)

generate_explanation(features)