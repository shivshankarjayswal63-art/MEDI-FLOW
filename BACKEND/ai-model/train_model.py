import pandas as pd
import numpy as np
import json
import os
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")

def main():
    print("Loading Training.csv (symptom-based disease prediction)...")
    train_df = pd.read_csv(os.path.join(DATASETS_DIR, "Training.csv"))
    test_df = pd.read_csv(os.path.join(DATASETS_DIR, "Testing.csv"))

    target_col = train_df.columns[-1]
    symptom_cols = [c for c in train_df.columns if c != target_col]

    X_train = train_df[symptom_cols].values
    y_train = train_df[target_col].values

    X_test = test_df[symptom_cols].values
    y_test = test_df[target_col].values

    print(f"Training set: {X_train.shape}")
    print(f"Testing set: {X_test.shape}")
    print(f"Unique conditions: {len(np.unique(y_train))}")

    label_encoder = LabelEncoder()
    y_train_enc = label_encoder.fit_transform(y_train)
    y_test_enc = label_encoder.transform(y_test)

    X_train_split, X_val, y_train_split, y_val = train_test_split(
        X_train, y_train_enc, test_size=0.2, random_state=42
    )

    print("\nTraining Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=30,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced',
    )
    model.fit(X_train_split, y_train_split)

    val_preds = model.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"Validation Accuracy: {val_acc:.4f}")

    test_preds = model.predict(X_test)
    test_acc = accuracy_score(y_test_enc, test_preds)
    print(f"Test Accuracy: {test_acc:.4f}")

    print("\nClassification Report (first 15 classes):")
    report = classification_report(y_val, val_preds, labels=np.unique(val_preds))
    print(report)

    model_path = os.path.join(BASE_DIR, "trained_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"\nModel saved to {model_path}")

    encoder_path = os.path.join(BASE_DIR, "label_encoder.pkl")
    with open(encoder_path, "wb") as f:
        pickle.dump(label_encoder, f)
    print(f"Label encoder saved to {encoder_path}")

    symptom_info = {
        "symptom_columns": symptom_cols,
        "label_classes": label_encoder.classes_.tolist(),
        "n_symptoms": len(symptom_cols),
        "n_classes": len(label_encoder.classes_),
    }
    info_path = os.path.join(BASE_DIR, "symptom_info.json")
    with open(info_path, "w") as f:
        json.dump(symptom_info, f, indent=2)
    print(f"Symptom info saved to {info_path}")

    print("\n" + "=" * 60)
    print("Loading heart disease dataset for heart risk model...")
    heart_df = pd.read_csv(
        os.path.join(DATASETS_DIR, "heart_disease", "heart.csv")
    )
    heart_feature_cols = [
        "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
        "thalach", "exang", "oldpeak", "slope", "ca", "thal",
    ]
    X_heart = heart_df[heart_feature_cols].values
    y_heart = heart_df["target"].values

    X_h_train, X_h_test, y_h_train, y_h_test = train_test_split(
        X_heart, y_heart, test_size=0.2, random_state=42
    )

    heart_model = RandomForestClassifier(
        n_estimators=200, max_depth=20, random_state=42, n_jobs=-1
    )
    heart_model.fit(X_h_train, y_h_train)

    heart_preds = heart_model.predict(X_h_test)
    heart_acc = accuracy_score(y_h_test, heart_preds)
    print(f"Heart Disease Model Accuracy: {heart_acc:.4f}")

    heart_model_path = os.path.join(BASE_DIR, "heart_model.pkl")
    with open(heart_model_path, "wb") as f:
        pickle.dump(heart_model, f)
    print(f"Heart model saved to {heart_model_path}")

    print("\nTraining complete!")


if __name__ == "__main__":
    main()
