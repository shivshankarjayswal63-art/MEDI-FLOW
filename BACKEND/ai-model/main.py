import json
import os
import pickle
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pymongo

try:
    import pandas as pd
except Exception:
    pd = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[""],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_pickle(path):
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


disease_model = _load_pickle(os.path.join(BASE_DIR, "trained_model.pkl"))
disease_label_encoder = _load_pickle(os.path.join(BASE_DIR, "label_encoder.pkl"))
heart_model = _load_pickle(os.path.join(BASE_DIR, "heart_model.pkl"))

symptom_info_path = os.path.join(BASE_DIR, "symptom_info.json")
if os.path.exists(symptom_info_path):
    with open(symptom_info_path, "r") as f:
        symptom_info = json.load(f)
else:
    symptom_info = {"symptom_columns": [], "label_classes": [], "n_symptoms": 0, "n_classes": 0}

SYMPTOM_COLUMNS = symptom_info["symptom_columns"]
LABEL_CLASSES = symptom_info["label_classes"]


def _load_mongo():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
        client.server_info()
        db = client.healthcare
        vitals_collection = db.vitals
        client.ping()
        return vitals_collection
    except Exception:
        return None


vitals_collection = _load_mongo()


class ChatRequest(BaseModel):
    message: str


class SymptomAnalysisRequest(BaseModel):
    symptoms: list


def parse_symptoms(message):
    """Extract known symptoms from user message using binary symptom columns."""
    message_lower = message.lower()
    matched = []
    for col in SYMPTOM_COLUMNS:
        symptom_text = col.replace("_", " ").lower()
        if symptom_text in message_lower:
            matched.append(col)
    return matched


def create_feature_vector(matched_symptoms):
    """Create a binary feature vector matching the model's training input."""
    if not SYMPTOM_COLUMNS:
        return None
    vec = np.zeros(len(SYMPTOM_COLUMNS), dtype=int)
    for sym in matched_symptoms:
        if sym in SYMPTOM_COLUMNS:
            idx = SYMPTOM_COLUMNS.index(sym)
            vec[idx] = 1
    return vec.reshape(1, -1)


def get_top_predictions(feature_vec, top_n=3):
    """Return top-N most likely conditions with confidence."""
    if disease_model is None:
        return []
    probs = disease_model.predict_proba(feature_vec)[0]
    classes = disease_model.classes_
    top_indices = np.argsort(probs)[::-1][:top_n]
    results = []
    for idx in top_indices:
        if probs[idx] > 0:
            condition = disease_label_encoder.inverse_transform([classes[idx]])[0]
            results.append({
                "condition": condition.replace("_", " ").title(),
                "confidence": round(float(probs[idx]) * 100, 2),
            })
    return results


def get_highest_prediction(feature_vec):
    """Return the single highest-confidence prediction."""
    if disease_model is None:
        return None, 0.0
    probs = disease_model.predict_proba(feature_vec)[0]
    classes = disease_model.classes_
    best_idx = np.argmax(probs)
    confidence = float(probs[best_idx])
    if confidence < 0.05:
        return None, 0.0
    condition = disease_label_encoder.inverse_transform([classes[best_idx]])[0]
    return condition, confidence


def get_severity_level(confidence, bp=120, pulse=75, sugar=100):
    """Map confidence to severity string, adjusting for vitals."""
    if confidence >= 0.85:
        level = "high"
    elif confidence >= 0.5:
        level = "medium"
    elif confidence >= 0.25:
        level = "low"
    else:
        level = "very low"

    if level in ("low", "very low"):
        if bp > 140 or pulse > 100:
            level = "medium"

    return level


condition_info = {
    "heart_attack": {
        "symptoms": [
            "chest pain", "shortness of breath", "sweating",
            "dizziness", "jaw pain", "left arm pain", "nausea",
        ],
        "risk_factors": [
            "high blood pressure", "high cholesterol", "smoking",
            "diabetes", "obesity", "family history", "stress",
        ],
        "prevention": [
            "regular exercise", "healthy diet", "quit smoking",
            "limit alcohol", "manage stress", "regular check-ups",
        ],
        "emergency_signs": [
            "severe chest pain", "pain spreading to arms/jaw",
            "sudden shortness of breath", "cold sweat", "lightheadedness",
        ],
    },
    "gastritis": {
        "symptoms": [
            "stomach pain", "bloating", "heartburn", "nausea",
            "vomiting", "loss of appetite", "feeling full quickly",
        ],
        "risk_factors": [
            "h. pylori infection", "regular nsaid use", "excessive alcohol",
            "stress", "autoimmune disorders", "bile reflux",
        ],
        "prevention": [
            "avoid irritating foods", "limit alcohol", "eat smaller meals",
            "manage stress", "avoid nsaids", "treatment for h. pylori",
        ],
        "diet_recommendations": [
            "avoid spicy foods", "limit acidic foods", "avoid caffeine",
            "eat high-fiber foods", "stay hydrated", "eat regularly",
        ],
        "treatment": [
            "proton pump inhibitors", "acid reducers", "antacids",
            "antibiotics (for H. pylori)", "eliminate trigger foods",
            "stress reduction techniques", "smaller meals", "avoid alcohol",
        ],
    },
}


def get_suggested_response(message):
    """Return predefined responses for common suggested queries."""
    message = message.lower().strip()

    suggested_responses = {
        "i have chest pain": (
            "Chest pain can be caused by heart issues (like angina or heart attack), "
            "lung problems, digestive issues, or muscle strain. "
            "Seek emergency medical attention for severe chest pain, especially with "
            "shortness of breath or pain radiating to arm/jaw. "
            "Does the pain come and go or is it constant?"
        ),
        "feeling dizzy": (
            "Dizziness may be caused by inner ear problems, dehydration, "
            "blood pressure issues, or anxiety. For persistent dizziness or if "
            "accompanied by severe headache or vision changes, please seek medical "
            "attention. Are you experiencing any other symptoms with your dizziness?"
        ),
        "stomach hurts": (
            "Stomach pain could be indigestion, gastritis, food poisoning, or "
            "something more serious like ulcers or appendicitis. The location and "
            "timing of your pain can help determine the cause. "
            "Can you describe where exactly the pain is located?"
        ),
        "shortness of breath": (
            "Shortness of breath may result from respiratory issues, heart problems, "
            "anxiety, or overexertion. Sudden severe breathing difficulty, especially "
            "with chest pain, could be an emergency requiring immediate medical attention. "
            "Is this a new symptom for you?"
        ),
        "how to treat gastritis?": (
            "Gastritis treatment includes medications like antacids or acid reducers, "
            "avoiding trigger foods (spicy, acidic), eating smaller meals, and avoiding "
            "alcohol and NSAIDs. For persistent symptoms, please consult with your "
            "healthcare provider for proper diagnosis and treatment plan."
        ),
    }

    return suggested_responses.get(message)


def get_condition_answer(message):
    """Extract health condition questions and provide answers based on the knowledge base."""
    message = message.lower()

    heart_attack_patterns = [r"heart attack", r"cardiac arrest", r"heart pain", r"heart condition"]
    gastritis_patterns = [r"gastritis", r"stomach inflammation", r"stomach pain", r"acid reflux", r"indigestion"]

    condition = None
    if any(re.search(p, message) for p in heart_attack_patterns):
        condition = "heart_attack"
    elif any(re.search(p, message) for p in gastritis_patterns):
        condition = "gastritis"

    if not condition:
        return None

    if re.search(r"symptom|sign|feel|experiencing", message):
        return f"Common symptoms of {condition.replace('_', ' ')} include: " + ", ".join(condition_info[condition]["symptoms"])

    if re.search(r"cause|risk factor|reason", message):
        return f"Risk factors for {condition.replace('_', ' ')} include: " + ", ".join(condition_info[condition]["risk_factors"])

    if re.search(r"prevent|avoid|stop", message):
        return f"Prevention measures for {condition.replace('_', ' ')} include: " + ", ".join(condition_info[condition]["prevention"])

    if re.search(r"treat|cure|heal|therapy|medication", message) and condition == "gastritis":
        return f"Treatment options for gastritis include: " + ", ".join(condition_info[condition]["treatment"])

    if condition == "heart_attack" and re.search(r"emergency|urgent|serious", message):
        return f"Emergency signs of a heart attack include: " + ", ".join(condition_info[condition]["emergency_signs"])

    if condition == "gastritis" and re.search(r"diet|eat|food", message):
        return f"Dietary recommendations for gastritis: " + ", ".join(condition_info[condition]["diet_recommendations"])

    if condition == "heart_attack":
        return (
            "A heart attack occurs when blood flow to part of the heart is blocked, "
            "causing damage to heart muscle. It's a medical emergency requiring immediate "
            "attention. Common symptoms include chest pain, shortness of breath, and pain "
            "radiating to the arm or jaw."
        )

    if condition == "gastritis":
        return (
            "Gastritis is inflammation of the stomach lining, often caused by infection, "
            "excessive alcohol, or regular use of certain pain relievers. Symptoms include "
            "stomach pain, nausea, and reduced appetite. Most cases can be managed with "
            "lifestyle changes and medication."
        )

    return None


@app.post("/api/chat/analyze")
async def analyze_chat(request: ChatRequest):
    """Analyze user symptoms from free-text chat messages."""
    message = request.message

    suggested_response = get_suggested_response(message)
    if suggested_response:
        return {"response": suggested_response}

    condition_answer = get_condition_answer(message.lower())
    if condition_answer:
        return {"response": condition_answer}

    matched_symptoms = parse_symptoms(message)

    if not matched_symptoms:
        return {
            "response": "Please describe your symptoms in more detail, or ask a specific question about heart attack or gastritis."
        }

    feature_vec = create_feature_vector(matched_symptoms)
    if feature_vec is None:
        return {"response": "Error: Disease model is not loaded."}

    condition, confidence = get_highest_prediction(feature_vec)

    if condition is None:
        top_predictions = get_top_predictions(feature_vec, top_n=3)
        if not top_predictions:
            return {
                "response": f"Based on symptoms ({', '.join(matched_symptoms)}), the system could not make a definitive prediction. Please consult a healthcare provider."
            }
        pred_str = "; ".join([f"{p['condition']} ({p['confidence']}%)" for p in top_predictions])
        return {
            "response": f"Based on symptoms ({', '.join(matched_symptoms)}), possible conditions are: {pred_str}. Please consult a healthcare provider for accurate diagnosis."
        }

    symptom_names = [s.replace("_", " ") for s in matched_symptoms]
    top_predictions = get_top_predictions(feature_vec, top_n=3)
    severity = get_severity_level(confidence)

    bp, pulse, sugar = 120, 75, 100
    if vitals_collection is not None:
        try:
            vitals = vitals_collection.find_one(sort=[("_id", -1)]) or {}
            bp = vitals.get("bp", 120)
            pulse = vitals.get("pulse", 75)
            sugar = vitals.get("sugar", 100)
        except Exception:
            pass

    severity = get_severity_level(confidence, bp, pulse, sugar)

    prediction_confidence = round(confidence * 100, 2)

    response = (
        f"Based on symptoms ({', '.join(symptom_names)}), the system predicts: "
        f"{condition} with {prediction_confidence}% confidence (Severity: {severity})."
    )

    vitals_note = ""
    if vitals_collection is not None and (bp > 140 or pulse > 100 or sugar > 140):
        vitals_note = (
            f" Note: Your recent vitals show elevated levels "
            f"(BP: {bp}, Pulse: {pulse}, Sugar: {sugar}). "
            f"This may indicate increased risk. Consider consulting a healthcare provider."
        )

    similar_predictions = ""
    if top_predictions:
        other_preds = [p for p in top_predictions if p["condition"] != condition.replace("_", " ").title()]
        if other_preds:
            similar_predictions = f" Other possibilities: " + "; ".join(
                [f"{p['condition']} ({p['confidence']}%)" for p in other_preds[:2]]
            )

    return {
        "response": response + vitals_note + similar_predictions,
        "prediction": condition,
        "confidence": prediction_confidence,
        "severity": severity,
        "symptoms_analyzed": symptom_names,
        "all_predictions": top_predictions,
    }


@app.post("/api/novelty/analyze")
async def analyze_symptoms(request: SymptomAnalysisRequest):
    """Structured symptom analysis endpoint for the 3D novelty features."""
    symptoms = [s.lower().strip().replace(" ", "_") for s in request.symptoms]

    matched = [s for s in symptoms if s in SYMPTOM_COLUMNS]

    if not SYMPTOM_COLUMNS:
        return {"prediction": "Error: Disease model not loaded."}

    feature_vec = create_feature_vector(matched)
    if feature_vec is None:
        return {"prediction": "Error: Could not create feature vector."}

    condition, confidence = get_highest_prediction(feature_vec)

    if condition is None:
        top_predictions = get_top_predictions(feature_vec, top_n=3)
        if not top_predictions:
            return {"prediction": "Could not determine condition from provided symptoms.", "confidence": 0}
        return {
            "prediction": "Possible conditions: " + "; ".join([f"{p['condition']} ({p['confidence']}%)" for p in top_predictions]),
            "confidence": 0,
            "all_predictions": top_predictions,
        }

    top_predictions = get_top_predictions(feature_vec, top_n=3)

    return {
        "prediction": condition,
        "confidence": round(confidence * 100, 2),
        "severity": get_severity_level(confidence),
        "all_predictions": top_predictions,
    }


@app.get("/api/model/status")
async def model_status():
    """Check if ML models are loaded and ready."""
    return {
        "disease_model_loaded": disease_model is not None,
        "disease_model_classes": len(LABEL_CLASSES),
        "heart_model_loaded": heart_model is not None,
        "symptom_columns": len(SYMPTOM_COLUMNS),
        "mongodb_connected": vitals_collection is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
