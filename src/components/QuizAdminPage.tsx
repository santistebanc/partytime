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
      <h2 className="mb-8 text-gray-600 text-3xl text-center">Quiz Game Admin</h2>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Topics and AI Generation Combined Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Topics & AI Generation</h3>
          <p className="text-gray-600">Add topics and generate questions using AI</p>
        </div>

        <div className="space-y-6">
          <div>
            <TopicManager />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !topics.length}
              className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
      <div>
        <QuestionManager />
      </div>
    </motion.div>
  );
};
