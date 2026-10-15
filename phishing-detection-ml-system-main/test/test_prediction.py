from src.preprocessing.feature_extraction import extract_url_features
from models.predict import predict_url


url = "http://192.168.1.1/login"
features = extract_url_features(url)
print("=== Features ===")
for feature, value in features.items():
    print(f"{feature}: {value}")

prediction = predict_url(features)

print("\n=== Prediction ===")
print(prediction)

print(model.classes_)
