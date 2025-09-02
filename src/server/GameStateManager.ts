import type * as Party from "partykit/server";
import type { GameState, User, Question, Round, GameStatus } from "./types/GameState";
import { broadcastMessage } from "./utils";

export class GameStateManager {
  private state: GameState;

  constructor(private room: Party.Room) {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      users: [],
      connections: {},
      status: "unstarted",
      topics: [],
      questions: [],
      currentQuestionIndex: 0,
      history: [],
      currentRespondent: "",
      captions: "",
    };
  }

  // State Management
  getState(): GameState {
    return { ...this.state };
  }

  async loadStateFromStorage(): Promise<void> {
    const storedState = (this.room.storage as any).gameState;
    if (storedState) {
      this.state = { ...this.getInitialState(), ...storedState };
    }
  }

  async saveStateToStorage(): Promise<void> {
    (this.room.storage as any).gameState = this.state;
  }

  // State Updates with Broadcasting
  private async updateState(updater: (state: GameState) => void): Promise<void> {
    updater(this.state);
    await this.saveStateToStorage();
    await this.broadcastState();
  }

  private async broadcastState(): Promise<void> {
    broadcastMessage(this.room, {
      type: "gameState",
      state: this.state,
    });
  }

  // User Management
  async addUser(userId: string, name: string, connectionId: string): Promise<void> {
    await this.updateState((state) => {
      const isFirstUser = state.users.length === 0;
      const newUser: User = {
        id: userId,
        name,
        isPlayer: true,
        isNarrator: false,
        isAdmin: isFirstUser,
      };
      
      state.users.push(newUser);
      state.connections[connectionId] = userId;
    });
  }

  async removeUser(userId: string, connectionId: string): Promise<void> {
    await this.updateState((state) => {
      state.users = state.users.filter(user => user.id !== userId);
      delete state.connections[connectionId];
    });
  }

  async updateUserName(userId: string, newName: string): Promise<void> {
    await this.updateState((state) => {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.name = newName;
      }
    });
  }

  async updateUserToggles(userId: string, toggles: Partial<Pick<User, 'isPlayer' | 'isNarrator' | 'isAdmin'>>): Promise<void> {
    await this.updateState((state) => {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        Object.assign(user, toggles);
      }
    });
  }

  // Question Management
  async addQuestion(question: Question): Promise<void> {
    await this.updateState((state) => {
      state.questions.push(question);
    });
  }

  async updateQuestion(updatedQuestion: Question): Promise<void> {
    await this.updateState((state) => {
      const index = state.questions.findIndex(q => q.id === updatedQuestion.id);
      if (index !== -1) {
        state.questions[index] = updatedQuestion;
      }
    });
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await this.updateState((state) => {
      state.questions = state.questions.filter(q => q.id !== questionId);
    });
  }

  async reorderQuestions(questionIds: string[]): Promise<void> {
    await this.updateState((state) => {
      const reorderedQuestions: Question[] = [];
      for (const id of questionIds) {
        const question = state.questions.find(q => q.id === id);
        if (question) {
          reorderedQuestions.push(question);
        }
      }
      state.questions = reorderedQuestions;
    });
  }

  // Topic Management
  async addTopic(topic: string): Promise<void> {
    await this.updateState((state) => {
      if (!state.topics.includes(topic)) {
        state.topics.push(topic);
      }
    });
  }

  async removeTopic(topic: string): Promise<void> {
    await this.updateState((state) => {
      state.topics = state.topics.filter(t => t !== topic);
    });
  }

  // Game Management
  async setGameStatus(status: GameStatus): Promise<void> {
    await this.updateState((state) => {
      state.status = status;
    });
  }

  async setCurrentQuestionIndex(index: number): Promise<void> {
    await this.updateState((state) => {
      state.currentQuestionIndex = index;
    });
  }

  async setCurrentRespondent(userId: string): Promise<void> {
    await this.updateState((state) => {
      state.currentRespondent = userId;
    });
  }

  async setCaptions(captions: string): Promise<void> {
    await this.updateState((state) => {
      state.captions = captions;
    });
  }

  async addRound(round: Round): Promise<void> {
    await this.updateState((state) => {
      state.history.push(round);
    });
  }

  // Utility Methods
  getUser(userId: string): User | undefined {
    return this.state.users.find(u => u.id === userId);
  }

  getUserByConnection(connectionId: string): User | undefined {
    const userId = this.state.connections[connectionId];
    return userId ? this.getUser(userId) : undefined;
  }

  getCurrentQuestion(): Question | undefined {
    return this.state.questions[this.state.currentQuestionIndex];
  }

  isFirstUser(): boolean {
    return this.state.users.length === 0;
  }

  getUserCount(): number {
    return this.state.users.length;
  }

  getConnectionCount(): number {
    return Object.keys(this.state.connections).length;
  }
}
