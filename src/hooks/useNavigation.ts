import { useCallback } from 'react';
import { useNavigation as useNavigationContext } from '../contexts/NavigationContext';

/**
 * Hook that provides both navigation actions and room/user state
 * Combines related functionality in one place
 */
export const useNavigation = () => {
  const { roomId, userName, navigateToRoom, navigateToLobby } = useNavigationContext();

  const handleNavigateToRoom = useCallback((roomId: string, userName: string) => {
    navigateToRoom(roomId, userName);
  }, [navigateToRoom]);

  const handleNavigateToLobby = useCallback(() => {
    navigateToLobby();
  }, [navigateToLobby]);

  return {
    roomId,
    userName,
    navigateToRoom: handleNavigateToRoom,
    navigateToLobby: handleNavigateToLobby,
  };
};
