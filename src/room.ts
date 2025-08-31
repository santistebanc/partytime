import type * as Party from "partykit/server";

interface User {
  id: string;
  name: string;
}

export default class RoomServer implements Party.Server {
  private users: Map<string, User> = new Map();
  private connections: Map<string, string> = new Map(); // connectionId -> userId

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
        case 'changeName':
          await this.handleNameChange(data, sender);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async onClose(conn: Party.Connection) {
    // Handle connection close
    const userId = this.connections.get(conn.id);
    if (userId) {
      console.log(`Connection closed for user ${userId}`);
      
      // Remove the connection mapping
      this.connections.delete(conn.id);
      
      // Check if user has any other active connections
      if (!this.hasActiveConnections(userId)) {
        console.log(`User ${userId} has no more active connections, removing from room`);
        this.removeUser(userId);
      } else {
        console.log(`User ${userId} still has active connections`);
      }
    }
  }

  private async handleJoin(
    data: { name: string; userId: string },
    sender: Party.Connection
  ) {
    console.log('handleJoin', data, sender);
    
    // Check if this user already exists
    const existingUser = this.users.get(data.userId);
    if (existingUser) {
      console.log(`User ${data.name} (${data.userId}) adding new connection to room ${this.room.id}`);
    } else {
      // New user joining
      const user: User = {
        id: data.userId,
        name: data.name
      };
      this.users.set(data.userId, user);
      console.log(`New user ${data.name} (${data.userId}) joined room ${this.room.id}`);
    }

    // Store connection mapping
    this.connections.set(sender.id, data.userId);
    
    console.log(`Total users in room: ${this.users.size}, total connections: ${this.connections.size}`);
    
    // Send confirmation to the user
    sender.send(JSON.stringify({
      type: 'joined',
      userId: data.userId,
      roomId: this.room.id
    }));

    // Broadcast updated user list to ALL users in the room
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

  private async handleNameChange(
    data: { oldName: string; newName: string; userId: string },
    sender: Party.Connection
  ) {
    console.log(`User ${data.oldName} changing name to ${data.newName}`);
    
    // Update the user's name in our local state
    const user = this.users.get(data.userId);
    if (user) {
      user.name = data.newName;
      console.log(`Name updated for user ${data.userId}: ${data.oldName} -> ${data.newName}`);
      
      // Broadcast the name change to all users in the room
      this.room.broadcast(JSON.stringify({
        type: 'nameChanged',
        userId: data.userId,
        oldName: data.oldName,
        newName: data.newName
      }));
      
      // Also broadcast updated user list
      this.broadcastUsers();
    } else {
      console.error(`User ${data.userId} not found for name change`);
    }
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

  private hasActiveConnections(userId: string): boolean {
    // Check if user has any active connections
    for (const connectionUserId of this.connections.values()) {
      if (connectionUserId === userId) {
        return true;
      }
    }
    return false;
  }

  private removeUser(userId: string) {
    console.log(`Removing user ${userId} from room`);
    
    // Remove user from users map
    this.users.delete(userId);
    
    // Remove all connections for this user
    for (const [connId, connectionUserId] of this.connections.entries()) {
      if (connectionUserId === userId) {
        this.connections.delete(connId);
      }
    }
    
    // Broadcast updated user list
    this.broadcastUsers();
  }
}

RoomServer satisfies Party.Worker;
