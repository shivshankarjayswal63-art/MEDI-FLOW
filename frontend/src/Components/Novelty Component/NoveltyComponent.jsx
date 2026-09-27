import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeartModelViewer from "./HeartModel/HeartModelViewer";

const getRecommendationsForResult = (analysisResult) => {
  const id = analysisResult?.primaryId;
  const urgent = analysisResult?.urgent;
  const common = [
    "This tool is for screening only — not a medical diagnosis.",
    "If symptoms worsen or you feel unsafe, seek urgent care.",
  ];
  if (urgent) {
    return [
      "Seek emergency medical care now if pain is severe or sudden.",
      "Call your local emergency number if you have trouble breathing or fainting.",
      ...common,
    ];
  }
  const byId = {
    cardiac_emergency: [
      "Avoid strenuous activity until evaluated by a clinician.",
      "Do not ignore chest pain especially with arm or jaw symptoms.",
      ...common,
    ],
    gerd_gastritis: [
      "Avoid spicy, acidic, and large meals for 24–48 hours.",
      "Stay hydrated; consider antacids only if you normally tolerate them.",
      ...common,
    ],
    peptic_ulcer: [
      "Avoid NSAIDs and alcohol until you see a doctor.",
      "Eat smaller, bland meals.",
      ...common,
    ],
    migraine: [
      "Rest in a dark, quiet room and hydrate.",
      "Note triggers (sleep, stress, screens) for your doctor.",
      ...common,
    ],
    asthma: [
      "Use your prescribed inhaler if you have one.",
      "Avoid smoke and strong odors; seek care if wheezing worsens.",
      ...common,
    ],
    pneumonia: [
      "Monitor fever and breathing; see a doctor within 24 hours if persistent.",
      ...common,
    ],
    anxiety_panic: [
      "Try slow breathing (4 seconds in, 6 seconds out) for several minutes.",
      "If this is your first episode of chest pain, still get medical advice.",
      ...common,
    ],
  };
  return byId[id] || [
    "Book an appointment with your GP or use MEDI FLOW to find a doctor.",
    "Track symptoms daily in analysis history.",
    ...common,
  ];
};

const NoveltyComponent = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const navigate = useNavigate();

  const symptomCategories = {
    "Chest & Heart": [
      { name: "Chest Pain", icon: "❤️" },
      { name: "Shortness of Breath", icon: "🫁" },
      { name: "Racing Heart", icon: "💓" },
      { name: "Left Arm Pain", icon: "💪" },
      { name: "Jaw Pain", icon: "🦷" },
      { name: "Sweating", icon: "💦" },
    ],
    Digestive: [
      { name: "Nausea", icon: "🤢" },
      { name: "Vomiting", icon: "🤮" },
      { name: "Stomach Pain", icon: "🔥" },
      { name: "Bloating", icon: "⭕" },
      { name: "Heartburn", icon: "🔥" },
      { name: "Loss of Appetite", icon: "🍽️" },
      { name: "Regurgitation", icon: "↩️" },
      { name: "Difficulty Swallowing", icon: "👅" },
    ],
    Neurological: [
      { name: "Dizziness", icon: "💫" },
      { name: "Fainting", icon: "😵" },
      { name: "Headache", icon: "🧠" },
      { name: "Confusion", icon: "❓" },
      { name: "Blurred Vision", icon: "👁️" },
    ],
    Respiratory: [
      { name: "Coughing", icon: "😷" },
      { name: "Coughing Blood", icon: "🩸" },
      { name: "Wheezing", icon: "🌬️" },
      { name: "Sudden Shortness of Breath", icon: "😮‍💨" },
    ],
  };

  const categoryThemes = {
    "Chest & Heart": {
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
      icon: "❤️",
      iconSize: "text-4xl",
    },
    Digestive: {
      gradient: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
      icon: "🍽️",
      iconSize: "text-4xl",
    },
    Neurological: {
      gradient: "linear-gradient(135deg, #B721FF 0%, #21D4FD 100%)",
      icon: "🧠",
      iconSize: "text-4xl",
    },
    Respiratory: {
      gradient: "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)",
      icon: "🫁",
      iconSize: "text-4xl",
    },
  };

  const sectionNames = Object.keys(symptomCategories);

  const goToNextSection = () => {
    if (currentSectionIndex < sectionNames.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      setLoading(true);
      submitAnalysis();
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const currentSectionName = sectionNames[currentSectionIndex];
  const currentSectionSymptoms =
    symptomCategories[currentSectionName]?.map((s) => s.name) || [];
  const currentTheme = categoryThemes[currentSectionName];

  const handleToggle = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    setShowAllSymptoms(true);
  };

  const submitAnalysis = async () => {
    if (!selectedSymptoms.length) {
      setPrediction("Please select at least one symptom.");
      setSeverity("unknown");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/novelty/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: selectedSymptoms }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const result = data.prediction || "No result";
      setAnalysisResult(data);
      setPrediction(result);
      localStorage.setItem("lastPrediction", result);

      const sev = data.severity || "low";
      setSeverity(sev);

      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/api/analysis/save`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symptoms: selectedSymptoms, prediction: result }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      setAnalysisResult(null);
      setPrediction("Error analyzing symptoms. Try again later.");
      setSeverity("unknown");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    high: "#e6317d",
    medium: "#FFC107",
    low: "#2fb297",
    unknown: "#828487",
  };

  const primaryLabel = analysisResult?.primaryCondition || "Symptom analysis";
  const displayConfidence = analysisResult?.confidence ?? 0;
  const displaySeverity = analysisResult?.severity || severity || "low";
  const rankings = analysisResult?.rankings || [];

  return (
    <div
      className="relative flex flex-col items-center min-h-screen px-4 py-10"
      style={{
        background: "radial-gradient(circle, #f0f4ff 0%, #e3eaff 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-40 h-40 bg-pink-200 rounded-full -top-10 -left-10 opacity-20 animate-blob"></div>
          <div className="absolute bg-blue-200 rounded-full top-20 right-20 w-60 h-60 opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-40 h-40 bg-green-200 rounded-full bottom-20 left-1/3 opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="absolute z-10 flex items-center px-3 py-2 text-gray-700 transition-colors bg-white rounded-full shadow-md top-4 left-4 hover:text-pink-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </motion.button>

      {!prediction ? (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
            AI Symptom Analyzer
          </h1>
          <p className="max-w-lg text-center text-gray-600">
            Select all symptoms you're experiencing for personalized analysis
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-4"
        >
          <h1 className="mb-2 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
            Analysis Results
          </h1>
        </motion.div>
      )}

      {prediction ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid w-full max-w-6xl grid-cols-1 gap-6"
        >
          <motion.div
            key={primaryLabel}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden bg-white shadow-xl rounded-xl"
          >
            <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500">
              <h2 className="text-lg sm:text-xl font-bold text-white">{primaryLabel}</h2>
              <p className="mt-2 text-sm text-white/90">{prediction}</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-800">Match strength</h3>
                      <div
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{
                          backgroundColor: severityColors[displaySeverity] + "20",
                          color: severityColors[displaySeverity],
                        }}
                      >
                        {String(displaySeverity).toUpperCase()} RISK
                      </div>
                    </div>
                    <div className="w-full h-4 mt-2 overflow-hidden bg-gray-200 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayConfidence}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: severityColors[displaySeverity] }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>0%</span>
                      <span className="font-semibold">{displayConfidence}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {rankings.length > 1 && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-lg font-semibold text-gray-800">Other possibilities</h3>
                      <ul className="space-y-2">
                        {rankings.slice(1, 4).map((r) => (
                          <li key={r.id || r.condition} className="flex justify-between text-sm text-gray-700">
                            <span>{r.condition}</span>
                            <span className="font-medium">{r.score}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">Your symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="px-2 py-1 text-xs rounded-full bg-[#2fb297]/15 text-[#2b2c6c] font-medium"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">Recommendations</h3>
                    <ul className="space-y-2">
                      {getRecommendationsForResult(analysisResult).map((rec, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <span className="mr-2 text-pink-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/analysis-history")}
                        className="px-6 py-3 font-medium text-white rounded-full shadow-lg bg-gradient-to-r from-[#2b2c6c] to-indigo-600"
                      >
                        View analysis history
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/health-trends")}
                        className="px-6 py-3 font-medium text-white rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-rose-500"
                      >
                        Health trends
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/3 min-w-0">
                  {analysisResult?.primaryId === "cardiac_emergency" && (
                    <div className="overflow-hidden rounded-lg h-64 md:h-80 border border-gray-200">
                      <HeartModelViewer
                        affectedSymptoms={selectedSymptoms.filter((s) =>
                          ["Chest Pain", "Shortness of Breath", "Racing Heart", "Left Arm Pain", "Jaw Pain", "Sweating"].includes(s)
                        )}
                        compact={false}
                        scale={2}
                      />
                    </div>
                  )}
                  {analysisResult?.primaryId === "gerd_gastritis" && (
                    <div className="overflow-hidden rounded-lg shadow-md">
                      <img src="/gastritis.jpg" alt="Digestive health" className="object-cover w-full h-auto" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <motion.div
            className="overflow-hidden bg-white shadow-xl rounded-xl"
            layoutId="symptomCard"
          >
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span>Progress</span>
                  <span>
                    {selectedSymptoms.length}/
                    {Object.values(symptomCategories).flat().length} symptoms
                  </span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (selectedSymptoms.length /
                          Object.values(symptomCategories).flat().length) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </div>
              {!showAllSymptoms ? (
                <motion.div
                  className="py-10 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-indigo-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-medium text-gray-800">
                    Let's Check Your Symptoms
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We'll help you identify possible health conditions based on
                    your symptoms
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className="px-6 py-3 mt-6 font-medium text-white transition-all transform rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    Start Symptom Analysis
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className="text-lg font-medium"
                        style={{ color: severityColors.high }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={currentSectionIndex}
                      >
                        {currentSectionIndex + 1} of {sectionNames.length}:{" "}
                        <span className="font-bold">{currentSectionName}</span>
                      </motion.div>
                      <div className="flex items-center">
                        {sectionNames.map((_, index) => (
                          <motion.div
                            key={index}
                            className={`w-3 h-3 mx-1 rounded-full ${
                              index === currentSectionIndex
                                ? "bg-gradient-to-r from-pink-500 to-purple-500"
                                : index < currentSectionIndex
                                ? "bg-indigo-300"
                                : "bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.2 }}
                          />
                        ))}
                      </div>
                    </div>
                    <motion.div
                      className="p-4 mb-4 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      key={`category-${currentSectionName}`}
                      style={{
                        background: currentTheme.gradient,
                      }}
                    >
                      <div className="flex items-center">
                        <span className={`${currentTheme.iconSize} mr-3`}>
                          {currentTheme.icon}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          {currentSectionName}
                        </h3>
                      </div>
                    </motion.div>
                  </div>
                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSectionIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        {symptomCategories[currentSectionName].map(
                          (symptomObj) => (
                            <motion.div
                              key={symptomObj.name}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleToggle(symptomObj.name)}
                              className={`flex items-center p-3 space-x-3 transition-all border rounded-lg cursor-pointer ${
                                selectedSymptoms.includes(symptomObj.name)
                                  ? "border-pink-500 bg-pink-50 shadow-sm"
                                  : "border-gray-200 hover:border-pink-200 hover:bg-pink-50/30"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-8 h-8 text-lg rounded-full ${
                                  selectedSymptoms.includes(symptomObj.name)
                                    ? "bg-pink-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {symptomObj.icon}
                              </div>
                              <span
                                className={`${
                                  selectedSymptoms.includes(symptomObj.name)
                                    ? "font-medium text-pink-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {symptomObj.name}
                              </span>
                              <div className="flex-grow"></div>
                              <div
                                className={`w-6 h-6 border rounded-md ${
                                  selectedSymptoms.includes(symptomObj.name)
                                    ? "bg-pink-500 border-pink-500"
                                    : "border-gray-300"
                                } flex items-center justify-center`}
                              >
                                {selectedSymptoms.includes(symptomObj.name) && (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <motion.div
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentSectionIndex > 0 ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToPreviousSection}
                        className="flex items-center px-4 py-2 text-gray-700 transition-all border border-gray-300 rounded-lg shadow hover:bg-gray-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </motion.button>
                    ) : (
                      <div>{/* Empty div for spacing */}</div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToNextSection}
                      className="flex items-center px-5 py-2 font-medium text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    >
                      {currentSectionIndex < sectionNames.length - 1 ? (
                        <>
                          Next Section
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          Analyze Symptoms
                          {loading ? (
                            <svg
                              className="w-5 h-5 ml-3 -mr-1 text-white animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          )}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
          {showAllSymptoms && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 mt-6 border border-blue-100 rounded-lg shadow-sm bg-blue-50"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Tip for accurate results
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    Select all symptoms you're experiencing, even if they seem
                    minor or unrelated.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default NoveltyComponent;
