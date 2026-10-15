def generate_message_explanation(message_vector, vectorizer, svm_model):

    feature_names = vectorizer.get_feature_names_out()
    coefficients = svm_model.coef_[0]

    indices = message_vector.nonzero()[1]

    contributions = []

    for idx in indices:

        tfidf = float(message_vector[0, idx])

        contribution = tfidf * coefficients[idx]

        contributions.append({
            "word": feature_names[idx],
            "score": float(contribution)
        })

    contributions.sort(
        key=lambda x: abs(x["score"]),
        reverse=True
    )

    phishing = []
    legitimate = []

    for item in contributions:

        if item["score"] < 0:
            phishing.append(item)
        else:
            legitimate.append(item)

    return phishing[:5], legitimate[:5]
