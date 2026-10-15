from flask import Flask, request, jsonify
from src.services.phishing_service import analyze_url
from src.services.message_service import analyze_message
from src.utils.validation import is_valid_url

app = Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        url = data.get("url")

        if not url:
            return jsonify({
                "error": "URL is required"
            }), 400

        # if not is_valid_url(url):
        #     return jsonify({
        #         "error": "Please provide a valid URL."
        #     }), 400

        result = analyze_url(url)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/predict/message", methods=["POST"])
def predict_message():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body is required"
            }), 400

        message = data.get("message")

        if not message:
            return jsonify({
                "error": "Message is required"
            }), 400

        result = analyze_message(message)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
