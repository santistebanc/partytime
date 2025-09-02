import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigation as useNavigationContext } from '../contexts/NavigationContext';
import { getStoredUserName, getStoredRoomId } from '../contexts/NavigationContext';

/**
 * Hook that provides navigation actions, room/user state, and form state management
 * Encapsulates all navigation-related logic in one place
 * Optimized to prevent unnecessary rerenders
 */
export const useNavigation = () => {
  const { roomId, userName, navigateToRoom, navigateToLobby } = useNavigationContext();
  
  // Get stored values for prefilling (these are stable, no need to memoize)
  const storedUserName = getStoredUserName();
  const storedRoomId = getStoredRoomId();
  
  // Local form state
  const [formName, setFormName] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  
  // Initialize form state with priority: URL params → stored values → empty
  useEffect(() => {
    if (userName) {
      setFormName(userName);
    } else if (storedUserName) {
      setFormName(storedUserName);
    }
    
    if (roomId) {
      setFormRoomId(roomId);
    } else if (storedRoomId) {
      setFormRoomId(storedRoomId);
    }
  }, [userName, roomId, storedUserName, storedRoomId]);

  // Memoize navigation functions to prevent unnecessary rerenders
  const handleNavigateToRoom = useCallback((roomId: string, userName: string) => {
    navigateToRoom(roomId, userName);
  }, [navigateToRoom]);

  const handleNavigateToLobby = useCallback(() => {
    navigateToLobby();
  }, [navigateToLobby]);

  // Memoize the return object to prevent unnecessary rerenders
  const result = useMemo(() => ({
    roomId,
    userName,
    navigateToRoom: handleNavigateToRoom,
    navigateToLobby: handleNavigateToLobby,
    // Form state and setters
    formName,
    setFormName,
    formRoomId,
    setFormRoomId,
  }), [
    roomId,
    userName,
    handleNavigateToRoom,
    handleNavigateToLobby,
    formName,
    setFormName,
    formRoomId,
    setFormRoomId,
  ]);

  return result;
};
