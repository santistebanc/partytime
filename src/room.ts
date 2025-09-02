import type * as Party from "partykit/server";
import type { GameState, User, Question, Round, GameStatus } from "./types";
import { broadcastMessage } from "./utils";
import { aiService } from "./aiService";

export default class RoomServer implements Party.Server {
  private state: GameState;

  constructor(readonly room: Party.Room) {
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

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Client connected: ${conn.id}`);
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      
      if (data.type !== 'stateChange') {
        console.warn(`Invalid message type: ${data.type}`);
        return;
      }

      const { action, payload } = data;
      console.log(`Processing: ${action}`, payload);

      // Handle state changes
      switch (action) {
        case 'join':
          await this.handleJoin(payload, sender);
          break;
        case 'leave':
          await this.handleLeave(payload, sender);
          break;
        case 'changeName':
          await this.handleChangeName(payload);
          break;
        case 'updateUserToggles':
          await this.handleUpdateUserToggles(payload);
          break;
        case 'addQuestion':
          await this.handleAddQuestion(payload);
          break;
        case 'deleteQuestion':
          await this.handleDeleteQuestion(payload);
          break;
        case 'reorderQuestions':
          await this.handleReorderQuestions(payload);
          break;
        case 'addTopic':
          await this.handleAddTopic(payload);
          break;
        case 'removeTopic':
          await this.handleRemoveTopic(payload);
          break;
        case 'generateQuestions':
          await this.handleGenerateQuestions(payload, sender);
          break;
        case 'setGameStatus':
          await this.handleSetGameStatus(payload);
          break;
        case 'setCurrentQuestionIndex':
          await this.handleSetCurrentQuestionIndex(payload);
          break;
        case 'setCurrentRespondent':
          await this.handleSetCurrentRespondent(payload);
          break;
        case 'setCaptions':
          await this.handleSetCaptions(payload);
          break;
        case 'addRound':
          await this.handleAddRound(payload);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  async onClose(conn: Party.Connection) {
    console.log(`Client disconnected: ${conn.id}`);
  }

  // State management
  private async updateState(updater: (state: GameState) => void): Promise<void> {
    updater(this.state);
    await this.saveState();
    await this.broadcastState();
  }

  private async saveState(): Promise<void> {
    (this.room.storage as any).gameState = this.state;
  }

  private async broadcastState(): Promise<void> {
    broadcastMessage(this.room, {
      type: "stateUpdate",
      state: this.state,
      success: true,
      timestamp: Date.now()
    });
  }

  // Handlers
  private async handleJoin(payload: { name: string; userId: string }, sender: Party.Connection) {
    await this.updateState((state) => {
      const existingUser = state.users.find(u => u.id === payload.userId);
      if (!existingUser) {
        const isFirstUser = state.users.length === 0;
        const newUser: User = {
          id: payload.userId,
          name: payload.name,
          isPlayer: true,
          isNarrator: false,
          isAdmin: isFirstUser,
        };
        state.users.push(newUser);
      }
      state.connections[sender.id] = payload.userId;
    });
  }

  private async handleLeave(payload: { userId: string }, sender: Party.Connection) {
    await this.updateState((state) => {
      state.users = state.users.filter(user => user.id !== payload.userId);
      delete state.connections[sender.id];
    });
  }

  private async handleChangeName(payload: { oldName: string; newName: string; userId: string }) {
    await this.updateState((state) => {
      const user = state.users.find(u => u.id === payload.userId);
      if (user) {
        user.name = payload.newName;
      }
    });
  }

  private async handleUpdateUserToggles(payload: { userId: string; isPlayer?: boolean; isNarrator?: boolean; isAdmin?: boolean }) {
    await this.updateState((state) => {
      const user = state.users.find(u => u.id === payload.userId);
      if (user) {
        if (payload.isPlayer !== undefined) user.isPlayer = payload.isPlayer;
        if (payload.isNarrator !== undefined) user.isNarrator = payload.isNarrator;
        if (payload.isAdmin !== undefined) user.isAdmin = payload.isAdmin;
      }
    });
  }

  private async handleAddQuestion(payload: { question: Question }) {
    await this.updateState((state) => {
      state.questions.push(payload.question);
    });
  }

  private async handleDeleteQuestion(payload: { questionId: string }) {
    await this.updateState((state) => {
      state.questions = state.questions.filter(q => q.id !== payload.questionId);
    });
  }

  private async handleReorderQuestions(payload: { questionIds: string[] }) {
    await this.updateState((state) => {
      const reorderedQuestions: Question[] = [];
      for (const id of payload.questionIds) {
        const question = state.questions.find(q => q.id === id);
        if (question) {
          reorderedQuestions.push(question);
        }
      }
      state.questions = reorderedQuestions;
    });
  }

  private async handleAddTopic(payload: { topic: string }) {
    await this.updateState((state) => {
      if (!state.topics.includes(payload.topic)) {
        state.topics.push(payload.topic);
      }
    });
  }

  private async handleRemoveTopic(payload: { topic: string }) {
    await this.updateState((state) => {
      state.topics = state.topics.filter(t => t !== payload.topic);
    });
  }

  private async handleGenerateQuestions(payload: { topics: string[]; count: number }, sender: Party.Connection) {
    try {
      const response = await aiService.generateQuizQuestions({
        topics: payload.topics,
        count: payload.count || 5
      });
      
      // Add generated questions to state
      for (const questionData of response.questions) {
        const question: Question = {
          ...questionData,
          id: crypto.randomUUID()
        };
        await this.handleAddQuestion({ question });
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  }

  private async handleSetGameStatus(payload: { status: string }) {
    await this.updateState((state) => {
      state.status = payload.status as GameStatus;
    });
  }

  private async handleSetCurrentQuestionIndex(payload: { index: number }) {
    await this.updateState((state) => {
      state.currentQuestionIndex = payload.index;
    });
  }

  private async handleSetCurrentRespondent(payload: { userId: string }) {
    await this.updateState((state) => {
      state.currentRespondent = payload.userId;
    });
  }

  private async handleSetCaptions(payload: { captions: string }) {
    await this.updateState((state) => {
      state.captions = payload.captions;
    });
  }

  private async handleAddRound(payload: { round: Round }) {
    await this.updateState((state) => {
      state.history.push(payload.round);
    });
  }
}
