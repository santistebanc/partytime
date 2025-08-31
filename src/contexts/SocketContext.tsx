import React, { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PartySocket } from 'partysocket';

interface SocketContextType {
  socket: PartySocket | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  roomId: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, roomId }) => {
  const socketRef = useRef<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Create and manage the PartySocket connection
  useEffect(() => {
    console.log('Creating PartySocket connection for room:', roomId);
    
    const socket = new PartySocket({
      host: window.location.hostname === 'localhost' ? 'localhost:1999' : window.location.hostname,
      room: roomId,
      party: 'room',
    });

    socketRef.current = socket;

    const handleOpen = () => {
      console.log('PartySocket connected for room:', roomId);
      setIsConnected(true);
    };

    const handleClose = () => {
      console.log('PartySocket disconnected for room:', roomId);
      setIsConnected(false);
    };

    const handleError = (error: Event) => {
      console.error('PartySocket error for room:', roomId, error);
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);

    return () => {
      console.log('Cleaning up PartySocket connection for room:', roomId);
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomId]);

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
