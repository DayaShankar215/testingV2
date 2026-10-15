from src.preprocessing.feature_extraction import extract_url_features
from src.utils.explanation import explain_prediction

url = "https://google.com"

features = extract_url_features(url)

result = explain_prediction(features)

print(result["phishing_push"].head(10))
print(result["legitimate_push"].head())