import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import type { QuizQuestion, User } from '../types/quiz';
import { generateUserId } from '../utils';
import { useSocketListener } from './useSocketListener';

export const useRoom = (roomId: string, userName: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [initialQuestions, setInitialQuestions] = useState<QuizQuestion[]>([]);
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [revealState, setRevealState] = useState<Record<string, boolean>>({});
  const [isPlayer, setIsPlayer] = useState(true);
  const [isNarrator, setIsNarrator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { socket, isConnected, sendMessage } = useSocket();

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
      } else if (data.type === 'questions') {
        console.log('Received questions from server:', data.questions);
        setInitialQuestions(data.questions);
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

  return {
    users,
    currentUserId,
    initialQuestions,
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
};
