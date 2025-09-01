import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "../types/quiz";
import { QuestionManager } from "./QuestionManager";
import { TopicManager } from "./TopicManager";
import { useSocket } from "../contexts/SocketContext";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { useTopicManagement } from "../hooks/useTopicManagement";
import { useQuestionManagement } from "../hooks/useQuestionManagement";

interface QuizAdminPageProps {
  initialQuestions?: QuizQuestion[];
  initialTopics?: string[];
  socket?: any; // PartySocket instance
}

export const QuizAdminPage: React.FC<QuizAdminPageProps> = ({
  initialQuestions = [],
  initialTopics = [],
  socket,
}) => {
  const { socket: contextSocket } = useSocket();
  const activeSocket = socket || contextSocket;
  
  const {
    questions,
    handleQuestionsChange,
    addQuestions,
    updateQuestionsFromProps
  } = useQuestionManagement(initialQuestions, activeSocket);
  
  const {
    topics,
    handleTopicsChange
  } = useTopicManagement(initialTopics, activeSocket);
  
  const {
    isGenerating,
    error,
    generateQuestions,
    clearError
  } = useAIGeneration(activeSocket);

  const handleGenerateQuestions = async () => {
    await generateQuestions(topics, addQuestions);
  };

  // Update local state when props change
  useEffect(() => {
    updateQuestionsFromProps(initialQuestions);
  }, [initialQuestions, updateQuestionsFromProps]);

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
              <TopicManager
                topics={topics}
                onTopicsChange={handleTopicsChange}
              />
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
          <QuestionManager
            questions={questions}
            onQuestionsChange={handleQuestionsChange}
            onQuestionAdd={() => {}} // Not needed anymore
            onQuestionUpdate={() => {}} // Not needed anymore
            onQuestionDelete={() => {}} // Not needed anymore
            onReorder={() => {}} // Not needed anymore
            socket={activeSocket}
          />
        </motion.div>
      </div>
    </div>
  );
};
