import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import type { QuizQuestion } from '../types/quiz';
import { useSocketMessage } from './useSocketMessage';
import { generateId } from '../utils';

export const useAIGeneration = (socket: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useSocketMessage(socket);

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
          id: generateId(),
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
