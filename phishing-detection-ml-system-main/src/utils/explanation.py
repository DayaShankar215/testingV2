import json
import pandas as pd
import shap
from models.predict import predict_url
from src.utils.feature_description import feature_descriptions

from xgboost import XGBClassifier

model = XGBClassifier()
model.load_model("models/url/xgb_model.ubj")

with open("notebooks/model_metadata.json") as f:
    metadata = json.load(f)

FEATURE_ORDER = metadata["feature_order"]

explainer = shap.TreeExplainer(model)


def explain_prediction(features):

    df = pd.DataFrame([features])
    df = df[FEATURE_ORDER]

    shap_values = explainer.shap_values(df)

    feature_contributions = pd.DataFrame(
        {
            "Feature": df.columns,
            "Feature_Value": df.iloc[0].values,
            "SHAP_Value": shap_values[0],
        }
    )
    print(feature_contributions[["Feature", "Feature_Value", "SHAP_Value"]])

    feature_contributions["Abs_SHAP"] = (
        feature_contributions["SHAP_Value"].abs()
    )

    legitimate_push = (
        feature_contributions[
            feature_contributions["SHAP_Value"] > 0
        ]
        .sort_values(
            by="SHAP_Value",
            ascending=False,
        )
    )

    phishing_push = (
        feature_contributions[
            feature_contributions["SHAP_Value"] < 0
        ]
        .sort_values(
            by="SHAP_Value"
        )
    )

    phishing_total = phishing_push["SHAP_Value"].sum()

    legitimate_total = legitimate_push["SHAP_Value"].sum()

    return {
        "all_features": feature_contributions,
        "phishing_push": phishing_push,
        "legitimate_push": legitimate_push,
        "phishing_total": phishing_total,
        "legitimate_total": legitimate_total,
    }


def generate_explanation(features):

    result = explain_prediction(features)

    phishing_push = result["phishing_push"]
    legitimate_push = result["legitimate_push"]

    phishing_total = result["phishing_total"]
    legitimate_total = result["legitimate_total"]

    top_phishing = phishing_push.head(3)
    top_legitimate = legitimate_push.head(3)

    prediction = predict_url(features)
    print("Raw Prediction:", prediction)
    print("Phishing Total:", phishing_total)
    print("Legitimate Total:", legitimate_total)

    if prediction == 1:
        prediction_label = "LEGITIMATE"
    else:
        prediction_label = "PHISHING"

    phishing_reasons = []

    for _, row in top_phishing.iterrows():

        feature = row["Feature"]

        reason = (
            feature_descriptions
            .get(feature, {})
            .get("negative", feature)
        )

        phishing_reasons.append(reason)

    legitimate_reasons = []

    for _, row in top_legitimate.iterrows():

        feature = row["Feature"]

        reason = (
            feature_descriptions
            .get(feature, {})
            .get("positive", feature)
        )

        legitimate_reasons.append(reason)

    if prediction_label == "PHISHING":

        final_explanation = (
            f"The model classified this URL as phishing. "
            f"The cumulative phishing influence score was {phishing_total:.2f}, "
            f"while the legitimate influence score was +{legitimate_total:.2f}. "
            f"In this explanation, negative scores represent features pushing the prediction toward phishing, "
            f"whereas positive scores represent features pushing it toward legitimacy."
        )

    else:

        final_explanation = (
            f"The model classified this URL as legitimate. "
            f"The cumulative legitimate influence score was +{legitimate_total:.2f}, "
            f"while the phishing influence score was {phishing_total:.2f}. "
            f"In this explanation, positive scores represent features pushing the prediction toward legitimacy, "
            f"whereas negative scores represent features pushing it toward phishing."
        )

    formatted_explanation = (
        "Factors increasing phishing suspicion:\n"
        + "\n".join(f"• {reason}" for reason in phishing_reasons)
        + "\n\nFactors supporting legitimacy:\n"
        + "\n".join(f"• {reason}" for reason in legitimate_reasons)
        + f"\n\nFinal Prediction: {prediction_label}"
        + f"\n\nConclusion:\n{final_explanation}"
    )

    return {
        "prediction": prediction_label,
        "phishing_reasons": phishing_reasons,
        "legitimate_reasons": legitimate_reasons,
        "conclusion": final_explanation,
        "formatted_explanation": formatted_explanation
    }
