import { useEffect } from 'react';

/**
 * Reusable hook for managing WebSocket event listeners
 * Eliminates duplicate event listener setup/cleanup logic
 */
export const useSocketListener = (
  socket: any, 
  eventType: string, 
  handler: (event: any) => void
) => {
  useEffect(() => {
    if (socket) {
      socket.addEventListener(eventType, handler);
      return () => socket.removeEventListener(eventType, handler);
    }
  }, [socket, eventType, handler]);
};
