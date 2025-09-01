/**
 * Shared utility functions to eliminate duplicate logic
 */

/**
 * Generate a random room ID
 * Eliminates duplicate room ID generation logic
 */
export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generate a random user ID
 * Uses the existing generateId utility for consistency
 */
export const generateUserId = (): string => {
  return crypto.randomUUID();
};
