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
  console.log(`Broadcasting users list: ${users.length} users`);
  console.log(
    "Users:",
    users.map((u) => `${u.name} (${u.id})`)
  );
};

/**
 * Send a message to a specific connection
 * Eliminates duplicate sendMessage methods
 */
export const sendMessage = (connection: Party.Connection, message: any): void => {
  connection.send(JSON.stringify(message));
};
