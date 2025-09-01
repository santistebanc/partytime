import { useCallback } from 'react';
import type { QuizQuestion } from '../types/quiz';

export const useQuestionManagement = (questions: QuizQuestion[], socket: any) => {
  const handleQuestionsChange = useCallback((newQuestions: QuizQuestion[]) => {
    // This is now just a pass-through since we don't maintain local state
  }, []);

  const addQuestions = useCallback((newQuestions: QuizQuestion[]) => {
    // This is now just a pass-through since we don't maintain local state
  }, []);

  const updateQuestions = useCallback((newQuestions: QuizQuestion[]) => {
    // This is now just a pass-through since we don't maintain local state
  }, []);

  return {
    questions,
    handleQuestionsChange,
    addQuestions,
    updateQuestions
  };
};
