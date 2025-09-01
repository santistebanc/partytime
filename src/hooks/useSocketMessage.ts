import { useCallback } from 'react';

/**
 * Reusable hook for sending messages through a WebSocket connection
 * Eliminates duplicate sendMessage logic across components
 */
export const useSocketMessage = (socket: any) => {
  return useCallback((message: any) => {
    if (socket) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);
};
