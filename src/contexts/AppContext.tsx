import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { PartySocket } from 'partysocket';
import type { GameState, User } from '../types';
import { generateUserId, generateRoomId } from '../utils';

// Simple localStorage helpers
const getStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStored = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
};

interface AppContextType {
  // Navigation
  roomId: string | null;
  userName: string | null;
  navigateToRoom: (roomId: string, userName: string) => void;
  navigateToLobby: () => void;
  createRoom: (userName: string) => void;
  
  // Connection
  isConnected: boolean;
  
  // Game State
  gameState: GameState;
  users: User[];
  connections: Record<string, string>;
  status: string;
  topics: string[];
  questions: any[];
  currentQuestionIndex: number;
  history: any[];
  currentRespondent: string;
  captions: string;
  currentUserId: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  
  // Actions
  sendMessage: (action: string, payload: any) => void;
  handleNameChange: (newName: string) => void;
  handlePlayerToggle: (value: boolean) => void;
  handleNarratorToggle: (value: boolean) => void;
  handleAdminToggle: (value: boolean) => void;
  
  // Game Actions
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  addQuestion: (question: any) => void;
  updateQuestion: (question: any) => void;
  updateRevealState: (questionId: string, revealed: boolean) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (questionIds: string[]) => void;
  generateQuestions: (topics: string[], count: number) => void;
  setGameStatus: (status: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentRespondent: (userId: string) => void;
  setCaptions: (captions: string) => void;
  addRound: (round: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Navigation state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);
  
  // Game state
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
  
  // User state
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Initialize from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');
    const urlUserName = urlParams.get('userName');
    
    setRoomId(urlRoomId);
    setUserName(urlUserName);
  }, []);

  // Navigation functions
  const updateURL = useCallback((newRoomId: string | null, newUserName: string | null) => {
    const urlParams = new URLSearchParams();
    if (newRoomId && newUserName) {
      urlParams.set('roomId', newRoomId);
      urlParams.set('userName', newUserName);
    }
    const newURL = urlParams.toString() ? `?${urlParams.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newURL);
  }, []);

  const navigateToRoom = useCallback((newRoomId: string, newUserName: string) => {
    setRoomId(newRoomId);
    setUserName(newUserName);
    updateURL(newRoomId, newUserName);
    setStored('partytime_last_user_name', newUserName);
    setStored('partytime_last_room_id', newRoomId);
  }, [updateURL]);

  const navigateToLobby = useCallback(() => {
    setRoomId(null);
    setUserName(null);
    updateURL(null, null);
  }, [updateURL]);

  const createRoom = useCallback((newUserName: string) => {
    const randomRoomId = generateRoomId();
    navigateToRoom(randomRoomId, newUserName);
  }, [navigateToRoom]);

  // Socket management
  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host: window.location.hostname === 'localhost' ? 'localhost:1999' : window.location.hostname,
      room: roomId,
      party: 'room',
    });

    socketRef.current = socket;

    const handleOpen = () => {
      setIsConnected(true);
      
      // Auto-join when connected
      if (userName) {
        let userId = getStored('partytime_last_user_id');
        if (!userId) {
          userId = generateUserId();
          setStored('partytime_last_user_id', userId);
        }
        setCurrentUserId(userId);
        
        // Send join message
        socket.send(JSON.stringify({
          type: 'stateChange',
          action: 'join',
          payload: { name: userName, userId },
          userId,
          timestamp: Date.now()
        }));
      }
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stateUpdate' && data.success && data.state) {
          setGameState(data.state);
          
          // User toggles are now computed from gameState
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('message', handleMessage);
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomId, userName, currentUserId]);

  // Message sending
  const sendMessage = useCallback((action: string, payload: any) => {
    if (isConnected && socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'stateChange',
        action,
        payload,
        userId: currentUserId,
        timestamp: Date.now()
      }));
    }
  }, [isConnected, currentUserId]);

  // User actions
  const handleNameChange = useCallback((newName: string) => {
    if (currentUserId && userName) {
      sendMessage('changeName', { oldName: userName, newName, userId: currentUserId });
    }
  }, [currentUserId, userName, sendMessage]);

  const handlePlayerToggle = useCallback((newValue: boolean) => {
    if (currentUserId) {
      sendMessage('updateUserToggles', { userId: currentUserId, isPlayer: newValue });
    }
  }, [currentUserId, sendMessage]);

  const handleNarratorToggle = useCallback((newValue: boolean) => {
    if (currentUserId) {
      sendMessage('updateUserToggles', { userId: currentUserId, isNarrator: newValue });
    }
  }, [currentUserId, sendMessage]);

  const handleAdminToggle = useCallback((newValue: boolean) => {
    if (currentUserId) {
      sendMessage('updateUserToggles', { userId: currentUserId, isAdmin: newValue });
    }
  }, [currentUserId, sendMessage]);

  // Game Actions
  const addTopic = useCallback((topic: string) => {
    sendMessage('addTopic', { topic });
  }, [sendMessage]);

  const removeTopic = useCallback((topic: string) => {
    sendMessage('removeTopic', { topic });
  }, [sendMessage]);

  const addQuestion = useCallback((question: any) => {
    sendMessage('addQuestion', { question });
  }, [sendMessage]);

  const updateQuestion = useCallback((question: any) => {
    sendMessage('updateQuestion', { question });
  }, [sendMessage]);

  const updateRevealState = useCallback((questionId: string, revealed: boolean) => {
    sendMessage('updateRevealState', { questionId, revealed });
  }, [sendMessage]);

  const deleteQuestion = useCallback((questionId: string) => {
    sendMessage('deleteQuestion', { questionId });
  }, [sendMessage]);

  const reorderQuestions = useCallback((questionIds: string[]) => {
    sendMessage('reorderQuestions', { questionIds });
  }, [sendMessage]);

  const generateQuestions = useCallback((topics: string[], count: number) => {
    sendMessage('generateQuestions', { topics, count });
  }, [sendMessage]);

  const setGameStatus = useCallback((status: string) => {
    sendMessage('setGameStatus', { status });
  }, [sendMessage]);

  const setCurrentQuestionIndex = useCallback((index: number) => {
    sendMessage('setCurrentQuestionIndex', { index });
  }, [sendMessage]);

  const setCurrentRespondent = useCallback((userId: string) => {
    sendMessage('setCurrentRespondent', { userId });
  }, [sendMessage]);

  const setCaptions = useCallback((captions: string) => {
    sendMessage('setCaptions', { captions });
  }, [sendMessage]);

  const addRound = useCallback((round: any) => {
    sendMessage('addRound', { round });
  }, [sendMessage]);

  const value: AppContextType = {
    // Navigation
    roomId,
    userName,
    navigateToRoom,
    navigateToLobby,
    createRoom,
    
    // Connection
    isConnected,
    
    // Game State
    gameState,
    users: gameState.users,
    connections: gameState.connections,
    status: gameState.status,
    topics: gameState.topics,
    questions: gameState.questions,
    currentQuestionIndex: gameState.currentQuestionIndex,
    history: gameState.history,
    currentRespondent: gameState.currentRespondent,
    captions: gameState.captions,
    currentUserId,
    isPlayer: gameState.users.find(u => u.id === currentUserId)?.isPlayer ?? false,
    isNarrator: gameState.users.find(u => u.id === currentUserId)?.isNarrator ?? false,
    isAdmin: gameState.users.find(u => u.id === currentUserId)?.isAdmin ?? false,
    
    // Actions
    sendMessage,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle,
    
    // Game Actions
    addTopic,
    removeTopic,
    addQuestion,
    updateQuestion,
    updateRevealState,
    deleteQuestion,
    reorderQuestions,
    generateQuestions,
    setGameStatus,
    setCurrentQuestionIndex,
    setCurrentRespondent,
    setCaptions,
    addRound,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
