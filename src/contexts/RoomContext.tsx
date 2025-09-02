import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useSocket } from '../contexts/SocketContext';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import type { GameState, User, Question } from '../types/quiz';
import { generateUserId } from '../utils';
import { useSocketListener } from '../hooks/useSocketListener';
import { useUnifiedMessage } from '../hooks/useUnifiedMessage';
import type { StateUpdateResponse } from '../types/UnifiedMessage';

interface RoomContextType {
  gameState: GameState;
  currentUserId: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  socket: any;
  handleNameChange: (newName: string) => void;
  handlePlayerToggle: (value: boolean) => void;
  handleNarratorToggle: (value: boolean) => void;
  handleAdminToggle: (value: boolean) => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { roomId, userName } = useNavigation();
  const { socket, isConnected } = useSocket();
  const { join, changeName, updateUserToggles } = useUnifiedMessage(socket);
  
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
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isPlayer, setIsPlayer] = useState(true);
  const [isNarrator, setIsNarrator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Join room when socket connects
  useEffect(() => {
    if (isConnected && socket) {
      let userId = getStoredUserId();
      if (!userId) {
        userId = generateUserId();
        setStoredUserId(userId);
      }
      
      console.log('Sending join message:', { name: userName, userId, roomId });
      
      if (userName) {
        join(userName, userId);
      }
    }
  }, [isConnected, socket, roomId, userName, join]);

  // Handle socket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      
      if (data.type === 'joined') {
        console.log('Joined room confirmation:', data);
        setCurrentUserId(data.userId);
        
        // Set user toggle states from server
        if (data.userToggles) {
          setIsPlayer(data.userToggles.isPlayer);
          setIsNarrator(data.userToggles.isNarrator);
          setIsAdmin(data.userToggles.isAdmin);
        }
      } else if (data.type === 'stateUpdate') {
        const stateUpdate = data as StateUpdateResponse;
        console.log('Received state update from server:', stateUpdate);
        
        if (stateUpdate.success && stateUpdate.state) {
          setGameState(stateUpdate.state);
          
          // Update current user's toggle states if available
          if (currentUserId) {
            const currentUser = stateUpdate.state.users.find((user: User) => user.id === currentUserId);
            if (currentUser) {
              setIsPlayer(currentUser.isPlayer);
              setIsNarrator(currentUser.isNarrator);
              setIsAdmin(currentUser.isAdmin);
            }
          }
        } else if (stateUpdate.error) {
          console.error('State update error:', stateUpdate.error);
        }
      } else if (data.type === 'gameState') {
        // Legacy support for old gameState messages
        console.log('Received legacy game state from server:', data.state);
        setGameState(data.state);
        
        // Update current user's toggle states if available
        if (currentUserId) {
          const currentUser = data.state.users.find((user: User) => user.id === currentUserId);
          if (currentUser) {
            setIsPlayer(currentUser.isPlayer);
            setIsNarrator(currentUser.isNarrator);
            setIsAdmin(currentUser.isAdmin);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, [currentUserId]);

  // Use the shared socket listener hook
  useSocketListener(socket, 'message', handleMessage);

  const handleNameChange = useCallback((newName: string) => {
    if (currentUserId && userName) {
      changeName(userName, newName, currentUserId);
    }
  }, [currentUserId, userName, changeName]);

  const handlePlayerToggle = useCallback((newValue: boolean) => {
    setIsPlayer(newValue);
    if (currentUserId) {
      updateUserToggles(currentUserId, { isPlayer: newValue });
    }
  }, [currentUserId, updateUserToggles]);

  const handleNarratorToggle = useCallback((newValue: boolean) => {
    setIsNarrator(newValue);
    if (currentUserId) {
      updateUserToggles(currentUserId, { isNarrator: newValue });
    }
  }, [currentUserId, updateUserToggles]);

  const handleAdminToggle = useCallback((newValue: boolean) => {
    setIsAdmin(newValue);
    if (currentUserId) {
      updateUserToggles(currentUserId, { isAdmin: newValue });
    }
  }, [currentUserId, updateUserToggles]);

  const roomState: RoomContextType = {
    gameState,
    currentUserId,
    isPlayer,
    isNarrator,
    isAdmin,
    socket,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle
  };
  
  return (
    <RoomContext.Provider value={roomState}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};
