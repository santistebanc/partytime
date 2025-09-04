import type * as Party from "partykit/server";

/**
 * Shared server utilities to eliminate duplicate code
 */

/**
 * Broadcast a message to all connections in a room
 * Eliminates duplicate broadcastMessage methods
 */
export const broadcastMessage = (room: Party.Room, message: any): void => {
  room.broadcast(JSON.stringify(message));
};

/**
 * Log user information consistently
 * Eliminates duplicate user logging logic
 */
export const logUsers = (users: any[]): void => {
  // Debug logging removed for production
};

/**
 * Send a message to a specific connection
 * Eliminates duplicate sendMessage methods
 */
export const sendMessage = (connection: Party.Connection, message: any): void => {
  connection.send(JSON.stringify(message));
};

/**
 * Generate a random room ID
 */
export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generate a random user ID
 */
export const generateUserId = (): string => {
  return crypto.randomUUID();
};
