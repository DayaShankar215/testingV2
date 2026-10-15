from src.preprocessing.message_preprocessing import clean_message
import joblib
from pathlib import Path

svm_model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


def predict_message(message: str):

    cleaned_message = clean_message(message)

    message_vector = vectorizer.transform([cleaned_message])

    prediction = svm_model.predict(message_vector)[0]

    if prediction == 0:
        label = "Phishing"
    else:
        label = "Legitimate"

    return {
        "prediction": label,
        "prediction_value": int(prediction)
    }
