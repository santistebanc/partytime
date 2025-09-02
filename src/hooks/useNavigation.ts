import { useNavigation as useNavigationContext } from '../contexts/NavigationContext';

/**
 * Hook that provides navigation actions, room/user state, and form state management
 * All logic is now handled in the context for optimal performance
 */
export const useNavigation = () => {
  return useNavigationContext();
};
