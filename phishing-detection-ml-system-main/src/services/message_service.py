import joblib
import re
from pathlib import Path
from src.preprocessing.sms_cleaner import clean_message
from src.utils.url_extractor import extract_urls
from src.services.phishing_service import analyze_url
from src.utils.message_explanation import generate_message_explanation
from src.utils.message_explainer import (
    get_top_contributions, score_concepts, generate_concept_explanations)


BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "message" / "message_svm_final.joblib"

svm_model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


def remove_urls(text):
    """
    Remove URLs from the message before message classification.
    """

    text = re.sub(r'\[(.*?)\]\((https?://.*?)\)', r'\1', text)

    text = re.sub(r'https?://\S+', ' ', text)
    text = re.sub(r'www\.\S+', ' ', text)

    return re.sub(r'\s+', ' ', text).strip()


def analyze_message(message: str):

    extracted_urls = extract_urls(message)

    message_without_urls = remove_urls(message)

    cleaned_message = clean_message(message_without_urls)

    print(f"Original : {message}")
    print(f"Without URLs : {message_without_urls}")
    print(f"Cleaned  : {cleaned_message}")
    print(f"Extracted URLs: {extracted_urls}")

    message_vector = vectorizer.transform([cleaned_message])

    contributions = get_top_contributions(
        message_vector,
        vectorizer,
        svm_model
    )
    print(f"Top Contributions: {contributions}")

    prediction = svm_model.predict(message_vector)[0]
    print(f"Prediction: {prediction}")

    message_is_spam = (prediction == 0)

    concept_scores = score_concepts(contributions)
    print("Concept Scores:")
    print(concept_scores)

    message_phishing_reasons, message_legitimate_reasons = (
        generate_concept_explanations(
            concept_scores,
            prediction="Phishing" if message_is_spam else "Legitimate"
        )
    )

    if message_is_spam and not message_phishing_reasons:
        message_phishing_reasons.append(
            "The message contained language patterns that the machine learning model associated with phishing."
        )

    if not message_is_spam and not message_legitimate_reasons:
        message_legitimate_reasons.append(
            "The message did not contain strong phishing-related language and its overall wording was consistent with legitimate communication."
        )

    url_results = []

    phishing_url_found = False

    for url in extracted_urls:

        result = analyze_url(url)

        url_results.append(result)

        if result["prediction"].upper() == "PHISHING":
            phishing_url_found = True

    if message_is_spam or phishing_url_found:
        final_prediction = "PHISHING"
        prediction_value = 0
    else:
        final_prediction = "LEGITIMATE"
        prediction_value = 1

    return {
        "Final prediction": final_prediction,
        "prediction_value": prediction_value,
        "message_prediction": "PHISHING" if message_is_spam else "LEGITIMATE",
        "message_phishing_reasons": message_phishing_reasons,
        "message_legitimate_reasons": message_legitimate_reasons,
        "urls_found": extracted_urls,
        "url_results": url_results
    }
