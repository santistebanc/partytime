import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import type { QuizQuestion } from '../types/quiz';

export const useAIGeneration = (socket: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to send messages without manually calling JSON.stringify
  const sendMessage = useCallback((message: any) => {
    if (socket) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const generateQuestions = async (topics: string[], onQuestionsGenerated: (questions: QuizQuestion[]) => void) => {
    if (!topics.length) {
      setError("Please add at least one topic first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiService.generateQuizQuestions({
        topics: topics,
        count: 5,
      });
      
      if (response.questions) {
        const newQuestions = response.questions.map((q: any) => ({
          ...q,
          id: crypto.randomUUID(),
        }));
        
        // Call the callback to update parent state
        onQuestionsGenerated(newQuestions);
        
        // Send to server
        newQuestions.forEach(question => {
          sendMessage({
            type: 'addQuestion',
            question
          });
        });
      } else {
        setError("Failed to generate questions");
      }
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    error,
    generateQuestions,
    clearError
  };
};
