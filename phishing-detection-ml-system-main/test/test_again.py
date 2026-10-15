from src.preprocessing.feature_extraction import extract_url_features
from models.predict import predict_url
def detect_url(url):

    features = extract_url_features(url)

    prediction = predict_url(features)

    return {
        "url": url,
        "prediction": prediction,
        "features": features
    }
result = detect_url("https://google.com")

print(result)