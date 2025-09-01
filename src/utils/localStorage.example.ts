/**
 * Example usage of the localStorage utility
 * This file demonstrates how to use the new localStorage utilities
 */

import { localstorage, LocalStorageUtils } from './localStorage';

// Example 1: Basic usage with the storage object
export const exampleBasicUsage = () => {
  // Store a simple value
  localstorage.set('user_preference', { theme: 'dark', language: 'en' });
  
  // Retrieve with default value
  const preferences = localstorage.get('user_preference', { theme: 'light', language: 'en' });
  console.log('User preferences:', preferences);
  
  // Check if key exists
  if (localstorage.has('user_preference')) {
    console.log('User preferences exist');
  }
  
  // Remove a key
  localstorage.remove('user_preference');
};

// Example 2: Using the class directly
export const exampleClassUsage = () => {
  // Store complex data
  const gameState = {
    level: 5,
    score: 1250,
    inventory: ['sword', 'potion', 'key'],
    settings: {
      sound: true,
      music: false,
      difficulty: 'hard'
    }
  };
  
  LocalStorageUtils.set('game_state', gameState);
  
  // Retrieve with type safety
  const savedState = LocalStorageUtils.get('game_state', {
    level: 1,
    score: 0,
    inventory: [],
    settings: {
      sound: true,
      music: true,
      difficulty: 'easy'
    }
  });
  
  console.log('Game state:', savedState);
};

// Example 3: Working with arrays
export const exampleArrayUsage = () => {
  // Store an array
  const recentSearches = ['react', 'typescript', 'localStorage'];
  localstorage.set('recent_searches', recentSearches);
  
  // Retrieve array with default
  const searches = localstorage.get('recent_searches', []);
  console.log('Recent searches:', searches);
  
  // Add new search
  const newSearches = [...searches, 'javascript'];
  localstorage.set('recent_searches', newSearches);
};

// Example 4: Utility functions
export const exampleUtilityFunctions = () => {
  // Get all keys
  const allKeys = localstorage.keys();
  console.log('All localStorage keys:', allKeys);
  
  // Get storage size
  const size = localstorage.size();
  console.log('localStorage size:', size, 'bytes');
  
  // Clear all data (use with caution!)
  // localstorage.clear();
};

// Example 5: Error handling
export const exampleErrorHandling = () => {
  // The utility automatically handles errors and returns default values
  const invalidData = localstorage.get('non_existent_key', 'default_value');
  console.log('Invalid key result:', invalidData); // 'default_value'
  
  // Even if localStorage is full or throws errors, it returns the default
  const safeData = localstorage.get('any_key', { fallback: true });
  console.log('Safe data:', safeData);
};
