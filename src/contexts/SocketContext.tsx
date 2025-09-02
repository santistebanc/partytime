import React, { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PartySocket } from 'partysocket';
import { useNavigation } from '../hooks/useNavigation';

interface SocketContextType {
  socket: PartySocket | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { roomId } = useNavigation();
  const socketRef = useRef<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Ensure roomId is a string (it should be since we're in Room component)
  const roomIdStr = roomId || '';

  // Create and manage the PartySocket connection
  useEffect(() => {
    console.log('Creating PartySocket connection for room:', roomIdStr);
    
    const socket = new PartySocket({
      host: window.location.hostname === 'localhost' ? 'localhost:1999' : window.location.hostname,
      room: roomIdStr,
      party: 'room',
    });

    socketRef.current = socket;

    const handleOpen = () => {
      console.log('PartySocket connected for room:', roomIdStr);
      setIsConnected(true);
    };

    const handleClose = () => {
      console.log('PartySocket disconnected for room:', roomIdStr);
      setIsConnected(false);
    };

    const handleError = (error: Event) => {
      console.error('PartySocket error for room:', roomIdStr, error);
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);

    return () => {
      console.log('Cleaning up PartySocket connection for room:', roomIdStr);
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomIdStr]);

  const sendMessage = useCallback((message: any) => {
    if (isConnected && socketRef.current) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, [isConnected]);

  const value = useMemo(() => ({
    socket: socketRef.current,
    isConnected,
    sendMessage,
  }), [isConnected, sendMessage]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
