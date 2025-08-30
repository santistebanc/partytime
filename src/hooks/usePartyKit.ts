import { useState, useEffect, useCallback, useRef } from 'react';
import { PartySocket } from 'partysocket';
import type { User, Question, GameState } from '../../party/server';

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface RoomState {
  users: User[];
  gameState: GameState;
  messages: Message[];
}

export function usePartyKit() {
  const [roomId, setRoomId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [roomState, setRoomState] = useState<RoomState>({
    users: [],
    gameState: {
      isActive: false,
      currentQuestionIndex: 0,
      currentBuzzer: null,
      questions: [],
      history: []
    },
    messages: []
  });

  const [party, setParty] = useState<PartySocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host: window.location.host,
      room: roomId,
      party: 'server',
      protocol: window.location.protocol === 'https:' ? 'wss' : 'ws'
    });
    
    socket.addEventListener('open', () => {
      console.log('Connected to party');
    });
    
    socket.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'roomState':
            setUser(data.user);
            setRoomState({
              users: data.users,
              gameState: data.gameState,
              messages: data.messages
            });
            break;
          case 'userJoined':
          case 'userLeft':
          case 'userUpdated':
            setRoomState(prev => ({
              ...prev,
              users: data.users
            }));
            break;
          case 'newMessage':
            setRoomState(prev => ({
              ...prev,
              messages: [...prev.messages, data.message]
            }));
            break;
          case 'gameStateUpdated':
          case 'nextQuestion':
          case 'questionsGenerated':
            setRoomState(prev => ({
              ...prev,
              gameState: data.gameState
            }));
            break;
          case 'buzzerActivated':
            // Handle buzzer activation
            break;
          case 'answerSubmitted':
            setRoomState(prev => ({
              ...prev,
              users: data.users,
              gameState: {
                ...prev.gameState,
                currentBuzzer: null
              }
            }));
            break;
          case 'gameFinished':
            setRoomState(prev => ({
              ...prev,
              gameState: data.gameState
            }));
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    
    socket.addEventListener('close', () => {
      console.log('Disconnected from party');
      setParty(null);
    });

    setParty(socket);

    return () => {
      socket.close();
    };
  }, [roomId]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (party) {
      party.send(JSON.stringify({ type, ...data }));
    }
  }, [party]);

  const updateUser = useCallback((updates: Partial<User>) => {
    sendMessage('updateUser', { updates });
  }, [sendMessage]);

  const sendChatMessage = useCallback((content: string) => {
    sendMessage('sendMessage', { content });
  }, [sendMessage]);

  const updateGameState = useCallback((gameState: Partial<GameState>) => {
    sendMessage('updateGameState', { gameState });
  }, [sendMessage]);

  const buzzIn = useCallback(() => {
    sendMessage('buzzIn', {});
  }, [sendMessage]);

  const submitAnswer = useCallback((answer: string) => {
    sendMessage('submitAnswer', { answer });
  }, [sendMessage]);

  const nextQuestion = useCallback(() => {
    sendMessage('nextQuestion', {});
  }, [sendMessage]);

  const generateQuestions = useCallback((topics: string[]) => {
    sendMessage('generateQuestions', { topics });
  }, [sendMessage]);

  const joinRoom = useCallback((newRoomId: string) => {
    setRoomId(newRoomId);
  }, []);

  const createRoom = useCallback(() => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setRoomId(newRoomId);
  }, []);

  return {
    roomId,
    user,
    roomState,
    party,
    updateUser,
    sendChatMessage,
    updateGameState,
    buzzIn,
    submitAnswer,
    nextQuestion,
    generateQuestions,
    joinRoom,
    createRoom
  };
}
