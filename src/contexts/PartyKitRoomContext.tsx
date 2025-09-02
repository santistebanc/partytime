import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import type { GameState, User } from '../types/quiz';
import { generateUserId } from '../utils';
import { useYPartyKit } from '../hooks/useYPartyKit';

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

  const {
    isConnected,
    gameState,
    provider,
    addUser: yjsAddUser,
    removeUser: yjsRemoveUser,
    updateUser: yjsUpdateUser,
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
  } = useYPartyKit({
    roomId: roomId || '',
    onStateChange: (newState) => {
      // Update current user's toggle states if available
      if (currentUserId) {
        const currentUser = newState.users.find((user: User) => user.id === currentUserId);
        if (currentUser) {
          setIsPlayer(currentUser.isPlayer);
          setIsNarrator(currentUser.isNarrator);
          setIsAdmin(currentUser.isAdmin);
        }
      }
    }
  });

  // Join room when connected
  useEffect(() => {
    if (isConnected && roomId && userName) {
      let userId = getStoredUserId();
      if (!userId) {
        userId = generateUserId();
        setStoredUserId(userId);
      }
      
      setCurrentUserId(userId);
      
      console.log('Joining y-partykit room:', { name: userName, userId, roomId });
      
      // Add user to the shared state
      const isFirstUser = gameState.users.length === 0;
      yjsAddUser({
        id: userId,
        name: userName,
        isPlayer: true,
        isNarrator: false,
        isAdmin: isFirstUser,
      });
    }
  }, [isConnected, roomId, userName, yjsAddUser, gameState.users.length]);

  const handleNameChange = useCallback((newName: string) => {
    if (currentUserId) {
      yjsUpdateUser(currentUserId, { name: newName });
    }
  }, [currentUserId, yjsUpdateUser]);

  const handlePlayerToggle = useCallback((newValue: boolean) => {
    setIsPlayer(newValue);
    if (currentUserId) {
      yjsUpdateUser(currentUserId, { isPlayer: newValue });
    }
  }, [currentUserId, yjsUpdateUser]);

  const handleNarratorToggle = useCallback((newValue: boolean) => {
    setIsNarrator(newValue);
    if (currentUserId) {
      yjsUpdateUser(currentUserId, { isNarrator: newValue });
    }
  }, [currentUserId, yjsUpdateUser]);

  const handleAdminToggle = useCallback((newValue: boolean) => {
    setIsAdmin(newValue);
    if (currentUserId) {
      yjsUpdateUser(currentUserId, { isAdmin: newValue });
    }
  }, [currentUserId, yjsUpdateUser]);

  const roomState: YPartyKitRoomContextType = {
    gameState,
    currentUserId,
    isPlayer,
    isNarrator,
    isAdmin,
    isConnected,
    provider,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle,
    // YPartyKit specific methods
    addUser: yjsAddUser,
    removeUser: yjsRemoveUser,
    updateUser: yjsUpdateUser,
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
