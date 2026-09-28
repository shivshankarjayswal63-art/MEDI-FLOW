import React from "react";
import { motion } from "framer-motion";

export default function SymptomVoicePanel({
  isListening,
  voiceMessage,
  voiceError,
  soundEnabled,
  onToggleSound,
  onMicClick,
  onSpeakResults,
  showReadAloud,
  showMic = true,
  recognitionSupported,
}) {
  return (
    <div className="w-full max-w-xl mx-auto mb-4 px-1">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/90 backdrop-blur-sm border border-pink-100 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {showMic && recognitionSupported ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onMicClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md transition-colors ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-gradient-to-r from-[#2b2c6c] to-indigo-600 hover:from-[#23245a]"
              }`}
              aria-pressed={isListening}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-1 6h-2v3h3v2H8v-2h3v-3H8v-2h8v2z" />
              </svg>
              {isListening ? "Listening…" : "Describe symptoms"}
            </motion.button>
          ) : (
            <span className="text-xs text-gray-500">Voice: use Chrome or Edge for best support</span>
          )}

          {showReadAloud && (
            <button
              type="button"
              onClick={onSpeakResults}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2b2c6c] bg-[#2fb297]/15 rounded-full hover:bg-[#2fb297]/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25z" />
              </svg>
              Read results aloud
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Sounds on" : "Sounds off"}
        >
          {soundEnabled ? (
            <svg className="w-4 h-4 text-[#2fb297]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          )}
          Sound {soundEnabled ? "on" : "off"}
        </button>
      </div>

      {(voiceMessage || voiceError) && (
        <p
          className={`mt-2 text-sm text-center px-2 ${voiceError ? "text-red-600" : "text-[#2b2c6c]"}`}
          role="status"
        >
          {voiceError || voiceMessage}
        </p>
      )}
    </div>
  );
}
