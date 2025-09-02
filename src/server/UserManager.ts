import type * as Party from "partykit/server";

export interface User {
  id: string;
  name: string;
}

export interface UserToggles {
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
}

export class UserManager {
  private users: Map<string, User> = new Map();
  private connections: Map<string, string> = new Map(); // connectionId -> userId

  constructor(private room: Party.Room) {}

  // User Management
  addUser(userId: string, name: string, isFirstUser: boolean = false): User {
    const user: User = {
      id: userId,
      name,
    };

    this.users.set(userId, user);
    
    // Check if user toggles already exist in storage, otherwise create defaults
    const existingToggles = this.getUserToggles(userId);
    if (!existingToggles) {
      const userToggleData: UserToggles = {
        isPlayer: true,
        isNarrator: false,
        isAdmin: isFirstUser,
      };
      this.updateUserToggles(userId, userToggleData);
    }
    
    return user;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  updateUserName(userId: string, newName: string): boolean {
    const user = this.users.get(userId);
    if (user) {
      user.name = newName;
      return true;
    }
    return false;
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
    
    // Remove all connections for this user
    for (const [connId, connectionUserId] of this.connections.entries()) {
      if (connectionUserId === userId) {
        this.connections.delete(connId);
      }
    }
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllUsersWithToggles(): (User & UserToggles)[] {
    return Array.from(this.users.values()).map(user => {
      const toggles = this.getUserToggles(user.id) || {
        isPlayer: true,
        isNarrator: false,
        isAdmin: false
      };
      return { ...user, ...toggles };
    });
  }

  getUserCount(): number {
    return this.users.size;
  }

  // Connection Management
  addConnection(connectionId: string, userId: string): void {
    this.connections.set(connectionId, userId);
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getUserIdByConnection(connectionId: string): string | undefined {
    return this.connections.get(connectionId);
  }

  hasActiveConnections(userId: string): boolean {
    for (const connectionUserId of this.connections.values()) {
      if (connectionUserId === userId) {
        return true;
      }
    }
    return false;
  }

  // User Toggles Management
  getUserToggles(userId: string): UserToggles | undefined {
    const storedToggles = (this.room.storage as any).userToggles || {};
    return storedToggles[userId];
  }

  updateUserToggles(userId: string, toggles: Partial<UserToggles>): boolean {
    const storedToggles = (this.room.storage as any).userToggles || {};
    const currentToggles = storedToggles[userId];
    
    if (currentToggles) {
      const updatedToggles = { ...currentToggles, ...toggles };
      storedToggles[userId] = updatedToggles;
      (this.room.storage as any).userToggles = storedToggles;
      return true;
    } else {
      // Create new toggles if they don't exist
      const newToggles: UserToggles = {
        isPlayer: true,
        isNarrator: false,
        isAdmin: false,
        ...toggles
      };
      storedToggles[userId] = newToggles;
      (this.room.storage as any).userToggles = storedToggles;
      return true;
    }
  }

  // Utility Methods
  isFirstUser(): boolean {
    return this.users.size === 0;
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}
