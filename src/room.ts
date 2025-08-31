import type * as Party from "partykit/server";

interface User {
  id: string;
  name: string;
  connectionId: string;
}

interface UserConnection {
  userId: string;
  connectionId: string;
}

export default class RoomServer implements Party.Server {
  private users: Map<string, User> = new Map();
  private connections: Map<string, UserConnection> = new Map();

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Connection established, but user needs to send join message
    console.log(`User connected to room ${this.room.id}`);
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          await this.handleJoin(data, sender);
          break;
        case 'leave':
          await this.handleLeave(data, sender);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async onClose(conn: Party.Connection) {
    // Find and remove the user who disconnected
    const userConnection = this.connections.get(conn.id);
    if (userConnection) {
      console.log(`User ${userConnection.userId} disconnected from room ${this.room.id}`);
      this.users.delete(userConnection.userId);
      this.connections.delete(conn.id);
      this.broadcastUsers();
    }
  }

  private async handleJoin(
    data: { name: string; userId: string },
    sender: Party.Connection
  ) {
    console.log('handleJoin', data, sender);
    const user: User = {
      id: data.userId,
      name: data.name,
      connectionId: sender.id
    };

    // Store user and connection mapping
    this.users.set(data.userId, user);
    this.connections.set(sender.id, { userId: data.userId, connectionId: sender.id });
    
    console.log(`User ${data.name} (${data.userId}) joined room ${this.room.id}`);
    console.log(`Total users in room: ${this.users.size}`);
    
    // Send confirmation to the user
    sender.send(JSON.stringify({
      type: 'joined',
      userId: data.userId,
      roomId: this.room.id
    }));

    // Broadcast updated user list to ALL users in the room (including the new user)
    this.broadcastUsers();
  }

  private async handleLeave(
    data: { userId: string },
    sender: Party.Connection
  ) {
    this.users.delete(data.userId);
    this.connections.delete(sender.id);
    this.broadcastUsers();
    
    sender.send(JSON.stringify({
      type: 'left',
      userId: data.userId
    }));
  }

  private broadcastUsers() {
    const usersList = Array.from(this.users.values());
    
    console.log(`Broadcasting users list: ${usersList.length} users`);
    console.log('Users:', usersList.map(u => `${u.name} (${u.id})`));
    
    // Broadcast to all connections except the one that just joined
    this.room.broadcast(JSON.stringify({
      type: 'users',
      users: usersList
    }));
  }
}

RoomServer satisfies Party.Worker;
