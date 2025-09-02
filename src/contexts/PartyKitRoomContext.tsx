import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import type { GameState, User } from '../types/quiz';
import { generateUserId } from '../utils';
import { useRoomContext } from './RoomContext';

interface YPartyKitRoomContextType {
  gameState: GameState;
  currentUserId: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  isConnected: boolean;
  provider: any;
  handleNameChange: (newName: string) => void;
  handlePlayerToggle: (value: boolean) => void;
  handleNarratorToggle: (value: boolean) => void;
  handleAdminToggle: (value: boolean) => void;
  // YPartyKit specific methods
  addUser: (user: any) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<any>) => void;
  addQuestion: (question: any) => void;
  updateQuestion: (questionId: string, updates: Partial<any>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (questionIds: string[]) => void;
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  setGameStatus: (status: any) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentRespondent: (userId: string) => void;
  setCaptions: (captions: string) => void;
  addRound: (round: any) => void;
}

const YPartyKitRoomContext = createContext<YPartyKitRoomContextType | null>(null);

interface YPartyKitRoomProviderProps {
  children: ReactNode;
}

export const YPartyKitRoomProvider: React.FC<YPartyKitRoomProviderProps> = ({ children }) => {
  const { roomId, userName } = useNavigation();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isPlayer, setIsPlayer] = useState(true);
  const [isNarrator, setIsNarrator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { gameState, currentUserId: existingUserId, isPlayer: existingIsPlayer, isNarrator: existingIsNarrator, isAdmin: existingIsAdmin, socket } = useRoomContext();

  // Sync with existing room context
  useEffect(() => {
    if (existingUserId) {
      setCurrentUserId(existingUserId);
      setIsPlayer(existingIsPlayer);
      setIsNarrator(existingIsNarrator);
      setIsAdmin(existingIsAdmin);
    }
  }, [existingUserId, existingIsPlayer, existingIsNarrator, existingIsAdmin]);

  const handleNameChange = useCallback((newName: string) => {
    // Use existing room context methods
  }, []);

  const handlePlayerToggle = useCallback((newValue: boolean) => {
    setIsPlayer(newValue);
  }, []);

  const handleNarratorToggle = useCallback((newValue: boolean) => {
    setIsNarrator(newValue);
  }, []);

  const handleAdminToggle = useCallback((newValue: boolean) => {
    setIsAdmin(newValue);
  }, []);

  const roomState: YPartyKitRoomContextType = {
    gameState,
    currentUserId,
    isPlayer,
    isNarrator,
    isAdmin,
    isConnected: true, // Assume connected if we have gameState
    provider: socket,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle,
    // Placeholder methods - implement as needed
    addUser: () => {},
    removeUser: () => {},
    updateUser: () => {},
    addQuestion: () => {},
    updateQuestion: () => {},
    deleteQuestion: () => {},
    reorderQuestions: () => {},
    addTopic: () => {},
    removeTopic: () => {},
    setGameStatus: () => {},
    setCurrentQuestionIndex: () => {},
    setCurrentRespondent: () => {},
    setCaptions: () => {},
    addRound: () => {},
  };
  
  return (
    <YPartyKitRoomContext.Provider value={roomState}>
      {children}
    </YPartyKitRoomContext.Provider>
  );
};

export const useYPartyKitRoomContext = (): YPartyKitRoomContextType => {
  const context = useContext(YPartyKitRoomContext);
  if (!context) {
    throw new Error('useYPartyKitRoomContext must be used within a YPartyKitRoomProvider');
  }
  return context;
};
