import { useCallback } from 'react';
import { useSocketMessage } from './useSocketMessage';
import type { UnifiedMessage, StateChangeAction } from '../types/UnifiedMessage';

export const useUnifiedMessage = (socket: any) => {
  const sendMessage = useSocketMessage(socket);

  const sendStateChange = useCallback((
    action: StateChangeAction,
    payload: any,
    userId?: string
  ) => {
    const message: UnifiedMessage = {
      type: 'stateChange',
      action,
      payload,
      userId,
      timestamp: Date.now()
    };

    sendMessage(message);
  }, [sendMessage]);

  // Convenience methods for common actions
  const join = useCallback((name: string, userId: string) => {
    sendStateChange('join', { name, userId }, userId);
  }, [sendStateChange]);

  const leave = useCallback((userId: string) => {
    sendStateChange('leave', { userId }, userId);
  }, [sendStateChange]);

  const changeName = useCallback((oldName: string, newName: string, userId: string) => {
    sendStateChange('changeName', { oldName, newName, userId }, userId);
  }, [sendStateChange]);

  const generateQuestions = useCallback((topics: string[], count: number) => {
    sendStateChange('generateQuestions', { topics, count });
  }, [sendStateChange]);

  const addQuestion = useCallback((question: any) => {
    sendStateChange('addQuestion', { question });
  }, [sendStateChange]);

  const updateQuestion = useCallback((question: any) => {
    sendStateChange('updateQuestion', { question });
  }, [sendStateChange]);

  const deleteQuestion = useCallback((questionId: string) => {
    sendStateChange('deleteQuestion', { questionId });
  }, [sendStateChange]);

  const reorderQuestions = useCallback((questionIds: string[]) => {
    sendStateChange('reorderQuestions', { questionIds });
  }, [sendStateChange]);

  const addTopic = useCallback((topic: string) => {
    sendStateChange('addTopic', { topic });
  }, [sendStateChange]);

  const removeTopic = useCallback((topic: string) => {
    sendStateChange('removeTopic', { topic });
  }, [sendStateChange]);

  const updateRevealState = useCallback((questionId: string, revealed: boolean) => {
    sendStateChange('updateRevealState', { questionId, revealed });
  }, [sendStateChange]);

  const updateUserToggles = useCallback((
    userId: string,
    toggles: { isPlayer?: boolean; isNarrator?: boolean; isAdmin?: boolean }
  ) => {
    sendStateChange('updateUserToggles', { userId, ...toggles }, userId);
  }, [sendStateChange]);

  const setGameStatus = useCallback((status: string) => {
    sendStateChange('setGameStatus', { status });
  }, [sendStateChange]);

  const setCurrentQuestionIndex = useCallback((index: number) => {
    sendStateChange('setCurrentQuestionIndex', { index });
  }, [sendStateChange]);

  const setCurrentRespondent = useCallback((userId: string) => {
    sendStateChange('setCurrentRespondent', { userId });
  }, [sendStateChange]);

  const setCaptions = useCallback((captions: string) => {
    sendStateChange('setCaptions', { captions });
  }, [sendStateChange]);

  const addRound = useCallback((round: any) => {
    sendStateChange('addRound', { round });
  }, [sendStateChange]);

  return {
    sendStateChange,
    join,
    leave,
    changeName,
    generateQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addTopic,
    removeTopic,
    updateRevealState,
    updateUserToggles,
    setGameStatus,
    setCurrentQuestionIndex,
    setCurrentRespondent,
    setCaptions,
    addRound
  };
};
