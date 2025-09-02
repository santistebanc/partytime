import type * as Party from "partykit/server";
import { GameStateManager } from "./GameStateManager";

export class ConnectionManager {
  constructor(
    private gameStateManager: GameStateManager,
    private room: Party.Room
  ) {}



  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): Promise<void> {
    // Connection established, but user needs to send join message
    console.log(`User connected to room ${this.room.id}`);
  }

  async onClose(conn: Party.Connection): Promise<void> {
    // Handle connection close
    const userId = this.gameStateManager.getUserByConnection(conn.id)?.id;
    if (userId) {
      console.log(`Connection closed for user ${userId}`);

      // Remove the user and connection
      await this.gameStateManager.removeUser(userId, conn.id);
    }
  }
}
