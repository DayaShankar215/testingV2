# Phishing Detection and Explainability System

## Project Overview

This project presents an integrated machine learning system for detecting phishing attempts from both **URLs** and **text messages** with XAI(Explanable AI). The system combines traditional machine learning models with explainable AI techniques to provide accurate predictions together with human-readable explanations.

The project consists of two independent detection pipelines:

### Phishing URL Detection

- Extracts URL-based features.
- Predicts whether a URL is phishing or legitimate using an XGBoost classifier.
- Generates feature-level explanations using SHAP (SHapley Additive Explanations).

### Phishing Message Detection

- Cleans and preprocesses incoming messages.
- Converts messages into TF-IDF feature vectors.
- Classifies messages using a Linear Support Vector Machine (Linear SVM).
- Generates concept-based, user-friendly explanations from the most influential words identified by the model.

The backend exposes REST APIs through Flask, allowing integration with external applications such as a Spring Boot backend, web application, or mobile application.

---

# Features

## URL Detection

- URL feature extraction
- XGBoost-based phishing detection
- SHAP explainability
- Human-readable phishing and legitimate explanations

## Message Detection

- SMS/message preprocessing
- TF-IDF vectorization
- Linear SVM classification
- Concept-based explanation generation
- Human-readable phishing and legitimate explanations

## API

- Flask REST API
- URL prediction endpoint
- Message prediction endpoint
- Automatic URL extraction from messages
- Combined phishing decision using both message and URL analysis

---

```

---

# Installation

## 1. Clone the repository

```bash
git clone <repository-url>
cd phishing-detection-ml-system
```

## 2. Create a virtual environment

```bash
python3 -m venv venv
```

Activate the virtual environment.

### macOS/Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

---

## 3. Install project dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Application

Start the Flask API by running:

```bash
python3 src/api/app.py
```

The application will start locally at:

```
http://127.0.0.1:5000
```

You can test the API using Postman or any REST client.

---

# Current Status

## URL Detection

- URL dataset preprocessing completed
- Feature extraction completed
- Model comparison completed
- XGBoost model selected
- Model evaluation completed
- SHAP explainability completed
- Human-readable explanation generation completed
- Flask API integration completed

## Message Detection

- SMS dataset preprocessing completed
- TF-IDF vectorization completed
- Model comparison completed
- Linear SVM model selected
- Model evaluation completed
- Concept-based explanation generation completed
- Human-readable explanation generation completed
- Flask API integration completed

---

# Technologies Used

- Python
- Flask
- Scikit-learn
- XGBoost
- SHAP
- Pandas
- NumPy
- NLTK
- Joblib

---

# Future Improvements

- BERT-based message classification
- Advanced explainability techniques for NLP
- Browser extension
- Mobile application
- Spring Boot integration
- Docker containerization
- Cloud deployment
- Real-time phishing monitoring