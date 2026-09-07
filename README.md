# 🏥 Smart Healthcare Management System (MEDI FLOW)

## Overview

MEDI FLOW is a modern web-based healthcare management system with an **AI-powered symptom-to-disease diagnosis model** trained on real medical data from Kaggle. The system streamlines medical services, enhances patient care, and optimizes hospital workflows.

---

## AI Symptom Diagnosis Model

### Model Performance

| Model | Algorithm | Accuracy | Purpose |
|-------|-----------|----------|---------|
| Disease Prediction | Random Forest (300 trees) | **97.6%** | 43 conditions from 134 symptoms |
| Heart Risk | Random Forest (200 trees) | **98.5%** | Cardiovascular risk assessment |

### Datasets

Public datasets downloaded from Kaggle (stored in `BACKEND/ai-model/datasets/`):

| Dataset | Rows | Use |
|---------|------|-----|
| Training.csv | 306 | Primary training (43 disease classes) |
| Testing.csv | 42 | Model validation |
| DiseaseAndSymptoms.csv | 4,920 | Extended symptom data |
| dataset.csv | 313 | Disease-symptom descriptions |
| heart.csv | 1,025 | Heart disease risk model |
| Symptom-severity.csv | 133 | Symptom weighting |
| Symptom-Description.csv | 41 | Disease descriptions |
| disease_description.csv | 42 | Medical descriptions |
| **Total** | **6,606** | |

### Training

```bash
cd BACKEND/ai-model
python train_model.py
```

Generates: `trained_model.pkl`, `heart_model.pkl`, `label_encoder.pkl`, `symptom_info.json`

### API Endpoints

```
POST /api/chat/analyze        # Analyze symptoms from chat message
POST /api/novelty/analyze     # Structured symptom array analysis
GET  /api/model/status       # Check model loading status
```

### Predictable Conditions (43)

The model predicts 43 conditions including: **AIDS, Acne, Alcoholic hepatitis, Allergy, Arthritis, Bronchial Asthma, Cervical spondylosis, Chicken pox, Chronic cholestasis, Common Cold, COVID, Dengue, Diabetes, Drug Reaction, Fungal infection, GERD, Gastroenteritis, Heart attack, Hepatitis A/B/C/D/E, Hypertension, Hyperthyroidism, Hypoglycemia, Hypothyroidism, Impetigo, Jaundice, Malaria, Migraine, Osteoarthritis, Paralysis, Paroxysmal Positional Vertigo, Peptic ulcer, Pneumonia, Psoriasis, Tuberculosis, Typhoid, UTI, Varicose veins** and more.

---

## 📌 Features

### Patient Management
- Complete patient profile management with detailed medical information
- Secure medical records
- Easy access to health history and prescriptions
- Real-time profile updates with validation

### Doctor & Appointment Management
- AI-powered smart appointment scheduling
- Online doctor booking with specialization filtering
- Appointment status tracking and notifications
- Doctor leave management system
- Complete diagnosis and prescription system

### Pharmacy Management
- Comprehensive medicine inventory control
- Stock expiration monitoring and alerts
- Batch tracking and location management
- Low stock notifications

### Reception Management
- AI-powered dynamic wait-time estimation
- Automated invoice & payment tracking
- Patient check-in/check-out management
- Visitor management system

### Novelty Features
- **Interactive 3D Heart Model** for visualizing cardiac symptoms
- **AI Health Chatbot** for preliminary symptom assessment
- **Vitals Monitoring System** with normal range indicators
- Real-time health analytics and metrics visualization

### Administrative Features
- Multi-user role-based access control (Admin, Doctor, Patient, Receptionist)
- Comprehensive reporting with PDF export
- Intuitive dashboards for each user role
- Appointment and diagnosis analytics

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js with functional components and hooks
- **Styling:** Tailwind CSS, Material-UI components
- **State Management:** React Context API
- **Routing:** React Router
- **3D Rendering:** Three.js (for heart model visualization)
- **PDF Generation:** jsPDF
- **Backend Services:** Firebase (Auth, Firestore, Storage, Analytics)

### Backend
- **Server:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer for appointment notifications
- **Cloud Storage:** Cloudinary for image upload and management
- **AI Integration:** Python-based health model (FastAPI)

### AI Components
- **Health Chatbot:** NLP-based symptom analysis using trained ML model
- **Disease Prediction:** RandomForest classifier (134 symptoms → 43 diseases)
- **Heart Risk Assessment:** Cardiovascular risk prediction model
- **Wait-time Estimation:** Predictive algorithms for queue management

---

## 🎨 Design System

- **Primary Blue:** #2b2c6c - Headers, important actions
- **Accent Pink:** #e6317d - Highlights, calls-to-action
- **Secondary Green:** #2fb297 - Success states, confirmations
- **Neutral Gray:** #71717d - Text, subtle elements

---

## 📂 Project Structure

```
MEDI FLOW/
├── BACKEND/
│   ├── index.js                  # Express server entry point
│   ├── package.json              # Node.js dependencies
│   ├── .env.example
│   ├── Controllers/              # API route controllers
│   ├── Models/                   # MongoDB schemas
│   ├── Routes/                   # API route definitions
│   ├── Middleware/               # Auth middlewares
│   └── ai-model/                 # Python AI system
│       ├── main.py               # FastAPI server
│       ├── train_model.py        # Model training script
│       ├── requirements.txt
│       ├── trained_model.pkl     # Trained disease model
│       ├── heart_model.pkl       # Heart disease model
│       ├── label_encoder.pkl
│       ├── symptom_info.json
│       └── datasets/             # Kaggle datasets
│           ├── Training.csv
│           ├── Testing.csv
│           ├── dataset.csv
│           ├── DiseaseAndSymptoms.csv
│           ├── Symptom-severity.csv
│           ├── Symptom-Description.csv
│           ├── disease_description.csv
│           └── heart_disease/heart.csv
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx              # React entry (with Firebase)
│       ├── firebase/config.js    # Firebase configuration
│       ├── App.jsx
│       ├── Components/           # React components
│       │   ├── Appointment Component/
│       │   ├── Doctor Component/
│       │   ├── Main Component/
│       │   ├── Nav Component/
│       │   ├── Novelty Component/  # AI features
│       │   ├── Pharmacy Component/
│       │   └── User Component/
│       └── services/
│           └── reportService.js
│
├── README.md
├── netlify.toml
└── AGENTS.md
```

---

## 💻 Installation and Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- Python 3.8+
- npm or yarn

### Backend Setup
```bash
cd BACKEND
npm install
cp .env.example .env
npm start
```

### AI Model Setup
```bash
cd BACKEND/ai-model
pip install -r requirements.txt

# Train the model (if not already trained)
python train_model.py

# Start AI API server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Key Features Showcase

### AI-Powered Health Chatbot
The chatbot uses the trained RandomForest model to predict diseases from user-reported symptoms:
- Input: Free-text symptom description or structured symptom array
- Output: Top-3 disease predictions with confidence scores and severity levels
- Integration: Vitals cross-check via MongoDB (adjusts severity based on BP, pulse, sugar)

### Interactive 3D Heart Model
Three.js-powered 3D visualization for cardiac symptom education.

### Digital Medical Records
Secure medical record management with role-based access control.

---

## 👥 Contributors

ITPM_Y3S1_WE_91 Group

---

## 📄 License

All Rights Reserved to MEDI FLOW