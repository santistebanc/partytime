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
  private userToggles: Map<string, UserToggles> = new Map();

  constructor(private room: Party.Room) {}

  // User Management
  addUser(userId: string, name: string, isFirstUser: boolean = false): User {
    const user: User = {
      id: userId,
      name,
    };

    this.users.set(userId, user);
    
    // Check if user toggles already exist in storage, otherwise create defaults
    const existingToggles = this.userToggles.get(userId);
    if (!existingToggles) {
      const userToggleData: UserToggles = {
        isPlayer: true,
        isNarrator: false,
        isAdmin: isFirstUser,
      };
      this.userToggles.set(userId, userToggleData);
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
      const toggles = this.userToggles.get(user.id) || {
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
    return this.userToggles.get(userId);
  }

  updateUserToggles(userId: string, toggles: Partial<UserToggles>): boolean {
    const currentToggles = this.userToggles.get(userId);
    
    if (currentToggles) {
      const updatedToggles = { ...currentToggles, ...toggles };
      this.userToggles.set(userId, updatedToggles);
      return true;
    }
    return false;
  }

  // Storage Operations
  async saveUserTogglesToStorage(): Promise<void> {
    const togglesData: Record<string, UserToggles> = {};
    for (const [userId, toggles] of this.userToggles.entries()) {
      togglesData[userId] = toggles;
    }
    
    (this.room.storage as any).userToggles = togglesData;
  }

  async loadUserTogglesFromStorage(): Promise<void> {
    const storedToggles = (this.room.storage as any).userToggles || {};
    
    for (const [userId, toggles] of Object.entries(storedToggles)) {
      const userToggles = toggles as UserToggles;
      this.userToggles.set(userId, userToggles);
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
