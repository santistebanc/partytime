import type * as Party from "partykit/server";
import { UserManager } from "./UserManager";

export class ConnectionManager {
  constructor(
    private userManager: UserManager,
    private room: Party.Room
  ) {}

  // Helper method to broadcast messages to all connections
  private broadcastMessage(message: any): void {
    this.room.broadcast(JSON.stringify(message));
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): Promise<void> {
    // Connection established, but user needs to send join message
    console.log(`User connected to room ${this.room.id}`);
  }

  async onClose(conn: Party.Connection): Promise<void> {
    // Handle connection close
    const userId = this.userManager.getUserIdByConnection(conn.id);
    if (userId) {
      console.log(`Connection closed for user ${userId}`);

      // Remove the connection mapping
      this.userManager.removeConnection(conn.id);

      // Check if user has any other active connections
      if (!this.userManager.hasActiveConnections(userId)) {
        console.log(
          `User ${userId} has no more active connections, removing from room`
        );
        this.userManager.removeUser(userId);
        
        // Broadcast updated user list
        this.broadcastUsers();
      } else {
        console.log(`User ${userId} still has active connections`);
      }
    }
  }

  private broadcastUsers(): void {
    const usersList = this.userManager.getAllUsers();

    console.log(`Broadcasting users list: ${usersList.length} users`);
    console.log(
      "Users:",
      usersList.map((u) => `${u.name} (${u.id})`)
    );

    this.broadcastMessage({
      type: "users",
      users: usersList,
    });
  }
}
