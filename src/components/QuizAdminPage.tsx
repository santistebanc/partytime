import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "../types";
import { QuestionManager } from "./QuestionManager";
import { TopicManager } from "./TopicManager";
import { useApp } from "../contexts/AppContext";

export const QuizAdminPage: React.FC = () => {
  const { topics, generateQuestions } = useApp();

  // Questions are now managed directly from props, no local state needed

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!topics.length) {
      setError("Please add at least one topic first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      generateQuestions(topics, 5);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="content-page admin-page"
    >
      <h2>Quiz Game Admin</h2>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Topics and AI Generation Combined Section */}
      <div className="topics-ai-section">
        <div className="topics-ai-header">
          <h3>Topics & AI Generation</h3>
          <p>Add topics and generate questions using AI</p>
        </div>

        <div className="topics-ai-content">
          <div className="topics-input-area">
            <TopicManager />
          </div>

          <div className="generate-button-area">
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !topics.length}
              className="btn btn-generate"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner loading-sm"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate Questions
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="questions-section">
        <QuestionManager />
      </div>
    </motion.div>
  );
};
