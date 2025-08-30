import type * as Party from "partykit/server";
import { nanoid } from "nanoid";

export interface User {
  id: string;
  name: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  points: number;
  isHost: boolean;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  options: string[];
  points: number;
  isBlurred: boolean;
}

export interface GameState {
  isActive: boolean;
  currentQuestionIndex: number;
  currentBuzzer: string | null;
  questions: Question[];
  history: Array<{
    question: Question;
    playerAnswer: string;
    correctAnswer: string;
    player: string;
    points: number;
    isCorrect: boolean;
  }>;
}

export interface RoomState {
  users: Map<string, User>;
  gameState: GameState;
  messages: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: number;
  }>;
}

export default class QuizServer implements Party.Server {
  private rooms = new Map<string, RoomState>();

  constructor(readonly party: Party.Party) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Generate a random room ID if not provided
    const url = new URL(ctx.request.url);
    const roomId = url.searchParams.get("room") || nanoid(8);
    
    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        users: new Map(),
        gameState: {
          isActive: false,
          currentQuestionIndex: 0,
          currentBuzzer: null,
          questions: [],
          history: []
        },
        messages: []
      };
      this.rooms.set(roomId, room);
    }

    // Create user
    const user: User = {
      id: conn.id,
      name: this.generateRandomName(),
      isPlayer: false,
      isNarrator: false,
      isAdmin: room.users.size === 0, // First user is admin
      points: 0,
      isHost: room.users.size === 0
    };

    room.users.set(conn.id, user);

    // Send room state to the new user
    conn.send(JSON.stringify({
      type: "roomState",
      roomId,
      user,
      users: Array.from(room.users.values()),
      gameState: room.gameState,
      messages: room.messages
    }));

    // Broadcast user joined to all users in the room
    this.broadcastToRoom(roomId, {
      type: "userJoined",
      user,
      users: Array.from(room.users.values())
    });
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);
      const room = this.findRoomByUserId(sender.id);
      if (!room) return;

      switch (data.type) {
        case "updateUser":
          this.handleUpdateUser(room, sender.id, data.updates);
          break;
        case "sendMessage":
          this.handleSendMessage(room, sender.id, data.content);
          break;
        case "updateGameState":
          this.handleUpdateGameState(room, data.gameState);
          break;
        case "buzzIn":
          this.handleBuzzIn(room, sender.id);
          break;
        case "submitAnswer":
          this.handleSubmitAnswer(room, sender.id, data.answer);
          break;
        case "nextQuestion":
          this.handleNextQuestion(room);
          break;
        case "generateQuestions":
          this.handleGenerateQuestions(room, data.topics);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  async onClose(conn: Party.Connection) {
    const room = this.findRoomByUserId(conn.id);
    if (room) {
      room.users.delete(conn.id);
      
      // If room is empty, delete it
      if (room.users.size === 0) {
        this.rooms.delete(this.getRoomIdByUserId(conn.id));
      } else {
        // Broadcast user left
        this.broadcastToRoom(this.getRoomIdByUserId(conn.id)!, {
          type: "userLeft",
          userId: conn.id,
          users: Array.from(room.users.values())
        });
      }
    }
  }

  private findRoomByUserId(userId: string): RoomState | undefined {
    for (const room of this.rooms.values()) {
      if (room.users.has(userId)) {
        return room;
      }
    }
    return undefined;
  }

  private getRoomIdByUserId(userId: string): string | undefined {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.has(userId)) {
        return roomId;
      }
    }
    return undefined;
  }

  private handleUpdateUser(room: RoomState, userId: string, updates: Partial<User>) {
    const user = room.users.get(userId);
    if (user) {
      Object.assign(user, updates);
      this.broadcastToRoom(this.getRoomIdByUserId(userId)!, {
        type: "userUpdated",
        user,
        users: Array.from(room.users.values())
      });
    }
  }

  private handleSendMessage(room: RoomState, userId: string, content: string) {
    const user = room.users.get(userId);
    if (user && content.trim()) {
      const message = {
        id: nanoid(),
        userId,
        userName: user.name,
        content: content.trim(),
        timestamp: Date.now()
      };
      room.messages.push(message);
      
      this.broadcastToRoom(this.getRoomIdByUserId(userId)!, {
        type: "newMessage",
        message
      });
    }
  }

  private handleUpdateGameState(room: RoomState, gameState: Partial<GameState>) {
    Object.assign(room.gameState, gameState);
    this.broadcastToRoom(this.getRoomIdByUserId(Array.from(room.users.keys())[0])!, {
      type: "gameStateUpdated",
      gameState: room.gameState
    });
  }

  private handleBuzzIn(room: RoomState, userId: string) {
    const user = room.users.get(userId);
    if (user && user.isPlayer && !room.gameState.currentBuzzer && room.gameState.isActive) {
      room.gameState.currentBuzzer = userId;
      this.broadcastToRoom(this.getRoomIdByUserId(userId)!, {
        type: "buzzerActivated",
        userId,
        userName: user.name
      });
    }
  }

  private handleSubmitAnswer(room: RoomState, userId: string, answer: string) {
    if (room.gameState.currentBuzzer === userId && room.gameState.isActive) {
      const currentQuestion = room.gameState.questions[room.gameState.currentQuestionIndex];
      if (currentQuestion) {
        // Simple answer evaluation (in a real app, you'd use an LLM)
        const isCorrect = this.evaluateAnswer(currentQuestion.answer, answer);
        const user = room.users.get(userId);
        const points = isCorrect ? currentQuestion.points : -Math.floor(currentQuestion.points / 2);
        
        if (user) {
          user.points += points;
        }

        const historyEntry = {
          question: currentQuestion,
          playerAnswer: answer,
          correctAnswer: currentQuestion.answer,
          player: user?.name || "Unknown",
          points,
          isCorrect
        };

        room.gameState.history.push(historyEntry);
        room.gameState.currentBuzzer = null;

        this.broadcastToRoom(this.getRoomIdByUserId(userId)!, {
          type: "answerSubmitted",
          historyEntry,
          users: Array.from(room.users.values())
        });
      }
    }
  }

  private handleNextQuestion(room: RoomState) {
    if (room.gameState.currentQuestionIndex < room.gameState.questions.length - 1) {
      room.gameState.currentQuestionIndex++;
      room.gameState.currentBuzzer = null;
      this.broadcastToRoom(this.getRoomIdByUserId(Array.from(room.users.keys())[0])!, {
        type: "nextQuestion",
        gameState: room.gameState
      });
    } else {
      // Game finished
      room.gameState.isActive = false;
      this.broadcastToRoom(this.getRoomIdByUserId(Array.from(room.users.keys())[0])!, {
        type: "gameFinished",
        gameState: room.gameState
      });
    }
  }

  private async handleGenerateQuestions(room: RoomState, topics: string[]) {
    // In a real app, you'd call an LLM API here
    // For now, we'll generate some sample questions
    const sampleQuestions: Question[] = [
      {
        id: nanoid(),
        question: "What is the capital of France?",
        answer: "Paris",
        options: ["London", "Berlin", "Paris", "Madrid"],
        points: 10,
        isBlurred: true
      },
      {
        id: nanoid(),
        question: "Which planet is known as the Red Planet?",
        answer: "Mars",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        points: 15,
        isBlurred: true
      }
    ];

    room.gameState.questions = sampleQuestions;
    this.broadcastToRoom(this.getRoomIdByUserId(Array.from(room.users.keys())[0])!, {
      type: "questionsGenerated",
      questions: sampleQuestions
    });
  }

  private evaluateAnswer(correctAnswer: string, userAnswer: string): boolean {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  }

  private generateRandomName(): string {
    const adjectives = ["Happy", "Clever", "Brave", "Wise", "Swift", "Bright", "Calm", "Eager"];
    const nouns = ["Dolphin", "Eagle", "Lion", "Owl", "Tiger", "Wolf", "Bear", "Fox"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  }

  private broadcastToRoom(roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const messageStr = JSON.stringify(message);
      for (const userId of room.users.keys()) {
        const conn = this.party.getConnection(userId);
        if (conn) {
          conn.send(messageStr);
        }
      }
    }
  }
}
