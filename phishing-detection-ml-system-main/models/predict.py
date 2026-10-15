import json
from xgboost import XGBClassifier
import pandas as pd


model = XGBClassifier()
model.load_model("models/url/xgb_model.ubj")

with open("notebooks/model_metadata.json") as f:
    metadata = json.load(f)

FEATURE_ORDER = metadata["feature_order"]


def predict_url(features):

    df = pd.DataFrame([features])

    df = df[FEATURE_ORDER]

    prediction = model.predict(df)

    return prediction[0]
