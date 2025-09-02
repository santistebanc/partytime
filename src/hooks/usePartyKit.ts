import { useEffect, useRef, useState, useCallback } from 'react';
import { YPartyKitProvider } from '../providers/YPartyKitProvider';
import type { GameState } from '../types/quiz';

interface UseYPartyKitOptions {
  roomId: string;
  onStateChange?: (state: GameState) => void;
}

export const useYPartyKit = ({ roomId, onStateChange }: UseYPartyKitOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    users: [],
    connections: {},
    status: "unstarted",
    topics: [],
    questions: [],
    currentQuestionIndex: 0,
    history: [],
    currentRespondent: "",
    captions: "",
  });

  const providerRef = useRef<YPartyKitProvider | null>(null);

  // Initialize YPartyKit provider
  useEffect(() => {
    if (!roomId) return;

    const provider = new YPartyKitProvider(roomId);
    providerRef.current = provider;

    // Set up state change handler
    provider.onStateChange((newState) => {
      setGameState(newState);
      onStateChange?.(newState);
    });

    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(provider.isConnected);
    };

    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
      provider.destroy();
    };
  }, [roomId, onStateChange]);

  // Helper methods for state manipulation
  const addUser = useCallback((user: any) => {
    providerRef.current?.addUser(user);
  }, []);

  const removeUser = useCallback((userId: string) => {
    providerRef.current?.removeUser(userId);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<any>) => {
    providerRef.current?.updateUser(userId, updates);
  }, []);

  const addQuestion = useCallback((question: any) => {
    providerRef.current?.addQuestion(question);
  }, []);

  const updateQuestion = useCallback((questionId: string, updates: Partial<any>) => {
    providerRef.current?.updateQuestion(questionId, updates);
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    providerRef.current?.deleteQuestion(questionId);
  }, []);

  const reorderQuestions = useCallback((questionIds: string[]) => {
    providerRef.current?.reorderQuestions(questionIds);
  }, []);

  const addTopic = useCallback((topic: string) => {
    providerRef.current?.addTopic(topic);
  }, []);

  const removeTopic = useCallback((topic: string) => {
    providerRef.current?.removeTopic(topic);
  }, []);

  const setGameStatus = useCallback((status: any) => {
    providerRef.current?.setGameStatus(status);
  }, []);

  const setCurrentQuestionIndex = useCallback((index: number) => {
    providerRef.current?.setCurrentQuestionIndex(index);
  }, []);

  const setCurrentRespondent = useCallback((userId: string) => {
    providerRef.current?.setCurrentRespondent(userId);
  }, []);

  const setCaptions = useCallback((captions: string) => {
    providerRef.current?.setCaptions(captions);
  }, []);

  const addRound = useCallback((round: any) => {
    providerRef.current?.addRound(round);
  }, []);

  return {
    isConnected,
    gameState,
    // State manipulation methods
    addUser,
    removeUser,
    updateUser,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addTopic,
    removeTopic,
    setGameStatus,
    setCurrentQuestionIndex,
    setCurrentRespondent,
    setCaptions,
    addRound,
    // Direct access to provider (for advanced usage)
    provider: providerRef.current,
  };
};
