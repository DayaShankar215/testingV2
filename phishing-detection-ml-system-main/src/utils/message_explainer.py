from src.utils.message_dictionary import WORD_TO_CONCEPT
from src.utils.concept_explanations import CONCEPT_EXPLANATIONS


def get_top_contributions(message_vector, vectorizer, svm_model, top_k=10):

    feature_names = vectorizer.get_feature_names_out()
    coefficients = svm_model.coef_[0]

    indices = message_vector.nonzero()[1]

    contributions = []

    for idx in indices:

        tfidf = message_vector[0, idx]

        contribution = tfidf * coefficients[idx]

        contributions.append({
            "word": feature_names[idx],
            "score": float(contribution)
        })

    contributions.sort(
        key=lambda x: abs(x["score"]),
        reverse=True
    )

    return contributions[:top_k]


def score_concepts(contributions):

    concept_scores = {}

    for item in contributions:

        word = item["word"]

        if word not in WORD_TO_CONCEPT:
            continue

        concept = WORD_TO_CONCEPT[word]

        concept_scores.setdefault(concept, 0)

        concept_scores[concept] += (item["score"])

    return concept_scores


def generate_concept_explanations(concept_scores, prediction):

    phishing = []
    legitimate = []

    for concept, score in concept_scores.items():

        if concept not in CONCEPT_EXPLANATIONS:
            continue

        explanation = CONCEPT_EXPLANATIONS[concept]

        if prediction == "Phishing":

            if explanation["type"] == "phishing" and score < 0:
                phishing.append(explanation["reason"])

        else:

            if explanation["type"] == "legitimate" and score > 0:
                legitimate.append(explanation["reason"])

    return phishing[:5], legitimate[:5]
