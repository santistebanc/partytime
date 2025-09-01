import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { generateRoomId } from '../utils';

interface NavigationContextType {
  roomId: string | null;
  userName: string | null;
  navigateToRoom: (roomId: string, userName: string) => void;
  navigateToLobby: () => void;
  createRoom: (userName: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

// Local storage keys
const STORAGE_KEYS = {
  LAST_USER_NAME: 'partytime_last_user_name',
  LAST_ROOM_ID: 'partytime_last_room_id',
  LAST_USER_ID: 'partytime_last_user_id'
};

// Helper functions for localStorage
const getFromStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

const setToStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
};

// Helper functions for user ID
export const getStoredUserId = (): string | null => {
  return getFromStorage(STORAGE_KEYS.LAST_USER_ID);
};

export const setStoredUserId = (userId: string): void => {
  setToStorage(STORAGE_KEYS.LAST_USER_ID, userId);
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Initialize from URL on mount, fallback to localStorage for prefilling only
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');
    const urlUserName = urlParams.get('userName');
    
    // Always set URL params for prefilling, even if only one is present
    setRoomId(urlRoomId);
    setUserName(urlUserName);
  }, []);

  const updateURL = useCallback((newRoomId: string | null, newUserName: string | null) => {
    const urlParams = new URLSearchParams();
    
    if (newRoomId && newUserName) {
      urlParams.set('roomId', newRoomId);
      urlParams.set('userName', newUserName);
    }
    
    const newURL = urlParams.toString() ? `?${urlParams.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newURL);
  }, []);

  const navigateToRoom = useCallback((newRoomId: string, newUserName: string, userId?: string) => {
    setRoomId(newRoomId);
    setUserName(newUserName);
    updateURL(newRoomId, newUserName);
    
    // Save to localStorage
    setToStorage(STORAGE_KEYS.LAST_USER_NAME, newUserName);
    setToStorage(STORAGE_KEYS.LAST_ROOM_ID, newRoomId);
    if (userId) {
      setToStorage(STORAGE_KEYS.LAST_USER_ID, userId);
    }
  }, [updateURL]);

  const navigateToLobby = useCallback(() => {
    setRoomId(null);
    setUserName(null);
    updateURL(null, null);
    
    // Don't clear localStorage - keep the values for next time
  }, [updateURL]);

  const createRoom = useCallback((newUserName: string) => {
    const randomRoomId = generateRoomId();
    navigateToRoom(randomRoomId, newUserName);
  }, [navigateToRoom]);

  const value: NavigationContextType = {
    roomId,
    userName,
    navigateToRoom,
    navigateToLobby,
    createRoom,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Export localStorage helpers for use in components
export const getStoredUserName = (): string | null => getFromStorage(STORAGE_KEYS.LAST_USER_NAME);
export const getStoredRoomId = (): string | null => getFromStorage(STORAGE_KEYS.LAST_ROOM_ID);
