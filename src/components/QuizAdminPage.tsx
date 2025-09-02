import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "../types";
import { QuestionManager } from "./QuestionManager";
import { TopicManager } from "./TopicManager";
import { useApp } from "../contexts/AppContext";


interface QuizAdminPageProps {}

export const QuizAdminPage: React.FC<QuizAdminPageProps> = () => {
  const { 
    topics,
    generateQuestions
  } = useApp();
  
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
    <div className="admin-content">
      <motion.div
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2>Quiz Game Admin</h2>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

            <div className="admin-sections">
        {/* Topics and AI Generation Combined Section */}
        <motion.div
          className="topics-ai-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="topics-ai-header">
            <h3>Topics & AI Generation</h3>
            <p>Add topics and generate questions using AI</p>
          </div>
          
          <div className="topics-ai-content">
            <div className="topics-input-area">
              <TopicManager />
            </div>
            
            <div className="generate-button-area">
              <motion.button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !topics.length}
                className="btn btn-generate"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wand2 size={16} />
                {isGenerating ? "Generating..." : "Generate Questions"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Questions Section */}
        <motion.div
          className="questions-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <QuestionManager />
        </motion.div>
      </div>
    </div>
  );
};
