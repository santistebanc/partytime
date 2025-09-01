import { useState, useCallback } from 'react';
import type { QuizQuestion } from '../types/quiz';

export const useQuestionManagement = (initialQuestions: QuizQuestion[], socket: any) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);

  const handleQuestionsChange = useCallback((newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
  }, []);

  const addQuestions = useCallback((newQuestions: QuizQuestion[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
  }, []);

  const updateQuestions = useCallback((newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
  }, []);

  const updateQuestionsFromProps = useCallback((newQuestions: QuizQuestion[]) => {
    if (newQuestions.length > 0) {
      setQuestions(newQuestions);
    }
  }, []);

  return {
    questions,
    handleQuestionsChange,
    addQuestions,
    updateQuestions,
    updateQuestionsFromProps
  };
};
