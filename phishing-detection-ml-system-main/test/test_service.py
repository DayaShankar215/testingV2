from src.services.phishing_service import analyze_url

url = "https://google.com"

result = analyze_url(url)

print(result["formatted_explanation"])
