import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useSocket } from '../contexts/SocketContext';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import type { QuizQuestion, User } from '../types/quiz';
import { generateUserId } from '../utils';
import { useSocketListener } from '../hooks/useSocketListener';

interface RoomContextType {
  users: User[];
  currentUserId: string;
  initialTopics: string[];
  revealState: Record<string, boolean>;
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
  const { socket, isConnected, sendMessage } = useSocket();
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [revealState, setRevealState] = useState<Record<string, boolean>>({});
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
      
      sendMessage({
        type: 'join',
        name: userName,
        userId
      });
    }
  }, [isConnected, socket, roomId, userName, sendMessage]);

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
      } else if (data.type === 'nameChanged') {
        console.log('Name changed:', data);
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === data.userId 
              ? { ...user, name: data.newName }
              : user
          )
        );
      } else if (data.type === 'topics') {
        console.log('Received topics from server:', data.topics);
        setInitialTopics(data.topics);
      } else if (data.type === 'users') {
        console.log('Setting users:', data.users);
        setUsers(data.users);
        
        // Update current user's toggle states if available
        if (currentUserId) {
          const currentUser = data.users.find((user: User) => user.id === currentUserId);
          if (currentUser) {
            setIsPlayer(currentUser.isPlayer);
            setIsNarrator(currentUser.isNarrator);
            setIsAdmin(currentUser.isAdmin);
          }
        }
      } else if (data.type === 'revealStateUpdated') {
        console.log('Reveal state updated:', data);
        setRevealState(prev => ({
          ...prev,
          [data.questionId]: data.revealed
        }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, [currentUserId]);

  // Use the shared socket listener hook
  useSocketListener(socket, 'message', handleMessage);

  const handleNameChange = useCallback((newName: string) => {
    if (currentUserId) {
      sendMessage({
        type: 'changeName',
        oldName: userName,
        newName: newName,
        userId: currentUserId
      });
    }
  }, [currentUserId, userName, sendMessage]);

  const handlePlayerToggle = useCallback((newValue: boolean) => {
    setIsPlayer(newValue);
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isPlayer: newValue
      });
    }
  }, [currentUserId, sendMessage]);

  const handleNarratorToggle = useCallback((newValue: boolean) => {
    setIsNarrator(newValue);
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isNarrator: newValue
      });
    }
  }, [currentUserId, sendMessage]);

  const handleAdminToggle = useCallback((newValue: boolean) => {
    setIsAdmin(newValue);
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isAdmin: newValue
      });
    }
  }, [currentUserId, sendMessage]);

  const roomState: RoomContextType = {
    users,
    currentUserId,
    initialTopics,
    revealState,
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
