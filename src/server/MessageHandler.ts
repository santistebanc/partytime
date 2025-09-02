import type * as Party from "partykit/server";
import { GameStateManager } from "./GameStateManager";
import { sendMessage, logUsers } from "./utils";
import { aiService } from "../aiService";

export class MessageHandler {
  constructor(
    private gameStateManager: GameStateManager,
    private room: Party.Room
  ) {}



  async handleMessage(message: string, sender: Party.Connection): Promise<void> {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join":
          await this.handleJoin(data, sender);
          break;
        case "leave":
          await this.handleLeave(data, sender);
          break;
        case "changeName":
          await this.handleNameChange(data, sender);
          break;
        case "generateQuestions":
          await this.handleGenerateQuestions(data, sender);
          break;
        case "addQuestion":
          await this.handleAddQuestion(data, sender);
          break;
        case "updateQuestion":
          await this.handleUpdateQuestion(data, sender);
          break;
        case "deleteQuestion":
          await this.handleDeleteQuestion(data, sender);
          break;
        case "reorderQuestions":
          await this.handleReorderQuestions(data, sender);
          break;
        case "getQuestions":
          await this.handleGetQuestions(sender);
          break;
        case "addTopic":
          await this.handleAddTopic(data, sender);
          break;
        case "removeTopic":
          await this.handleRemoveTopic(data, sender);
          break;
        case "getTopics":
          await this.handleGetTopics(sender);
          break;
        case "updateRevealState":
          await this.handleUpdateRevealState(data, sender);
          break;
        case "updateUserToggles":
          await this.handleUpdateUserToggles(data, sender);
          break;
        default:
          console.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private async handleJoin(
    data: { name: string; userId: string },
    sender: Party.Connection
  ): Promise<void> {
    console.log("handleJoin", data, sender);

    // Load state from storage
    await this.gameStateManager.loadStateFromStorage();

    // Check if this user already exists
    const existingUser = this.gameStateManager.getUser(data.userId);
    if (existingUser) {
      console.log(
        `User ${data.name} (${data.userId}) adding new connection to room ${this.room.id}`
      );
    } else {
      // New user joining
      await this.gameStateManager.addUser(data.userId, data.name, sender.id);
      console.log(
        `New user ${data.name} (${data.userId}) joined room ${this.room.id}`
      );
    }

    // Send current game state to the joining user
    const currentState = this.gameStateManager.getState();
    sendMessage(sender, {
      type: "gameState",
      state: currentState,
    });

    console.log(
      `Total users in room: ${this.gameStateManager.getUserCount()}, total connections: ${this.gameStateManager.getConnectionCount()}`
    );

    // Send confirmation to the user
    const user = this.gameStateManager.getUser(data.userId);
    sendMessage(sender, {
      type: "joined",
      userId: data.userId,
      roomId: this.room.id,
      userToggles: user ? {
        isPlayer: user.isPlayer,
        isNarrator: user.isNarrator,
        isAdmin: user.isAdmin
      } : {
        isPlayer: true,
        isNarrator: false,
        isAdmin: this.gameStateManager.getUserCount() === 1
      }
    });
  }

  private async handleLeave(
    data: { userId: string },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.removeUser(data.userId, sender.id);

    sendMessage(sender, {
      type: "left",
      userId: data.userId,
    });
  }

  private async handleNameChange(
    data: { oldName: string; newName: string; userId: string },
    sender: Party.Connection
  ): Promise<void> {
    console.log(`User ${data.oldName} changing name to ${data.newName}`);

    await this.gameStateManager.updateUserName(data.userId, data.newName);
    console.log(
      `Name updated for user ${data.userId}: ${data.oldName} -> ${data.newName}`
    );
  }

  private async handleGenerateQuestions(
    data: { topics: string[]; count: number },
    sender: Party.Connection
  ): Promise<void> {
    console.log("AI question generation requested for topics:", data.topics);
    
    try {
      const response = await aiService.generateQuizQuestions({
        topics: data.topics,
        count: data.count || 5
      });
      
      // Send success response
      sendMessage(sender, {
        type: "questionsGenerated",
        questions: response.questions
      });
      
      console.log(`Generated ${response.questions.length} questions successfully`);
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Send error response
      sendMessage(sender, {
        type: "questionsGenerationError",
        error: error instanceof Error ? error.message : "Failed to generate questions"
      });
    }
  }

  private async handleAddQuestion(
    data: { question: any },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.addQuestion(data.question);
    console.log("Question added:", data.question.id);
  }

  private async handleUpdateQuestion(
    data: { question: any },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.updateQuestion(data.question);
    console.log("Question updated:", data.question.id);
  }

  private async handleDeleteQuestion(
    data: { questionId: string },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.deleteQuestion(data.questionId);
    console.log("Question deleted:", data.questionId);
  }

  private async handleReorderQuestions(
    data: { questionIds: string[] },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.reorderQuestions(data.questionIds);
    console.log("Questions reordered");
  }

  private async handleGetQuestions(sender: Party.Connection): Promise<void> {
    const state = this.gameStateManager.getState();
    sendMessage(sender, {
      type: "questions",
      questions: state.questions,
    });
  }

  private async handleAddTopic(
    data: { topic: string },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.addTopic(data.topic);
    console.log("Topic added:", data.topic);
  }

  private async handleRemoveTopic(
    data: { topic: string },
    sender: Party.Connection
  ): Promise<void> {
    await this.gameStateManager.removeTopic(data.topic);
    console.log("Topic removed:", data.topic);
  }

  private async handleGetTopics(sender: Party.Connection): Promise<void> {
    const state = this.gameStateManager.getState();
    sendMessage(sender, {
      type: "topics",
      topics: state.topics,
    });
  }

  private async handleUpdateRevealState(
    data: { questionId: string; revealed: boolean },
    sender: Party.Connection
  ): Promise<void> {
    // This would be handled by the GameStateManager in a more complex implementation
    // For now, we'll just log it
    console.log(`Question ${data.questionId} reveal state updated to ${data.revealed}`);
  }

  private async handleUpdateUserToggles(
    data: { userId: string; isPlayer?: boolean; isNarrator?: boolean; isAdmin?: boolean },
    sender: Party.Connection
  ): Promise<void> {
    const toggles: any = {};
    if (data.isPlayer !== undefined) toggles.isPlayer = data.isPlayer;
    if (data.isNarrator !== undefined) toggles.isNarrator = data.isNarrator;
    if (data.isAdmin !== undefined) toggles.isAdmin = data.isAdmin;

    await this.gameStateManager.updateUserToggles(data.userId, toggles);
    console.log(`User toggles updated for ${data.userId}:`, toggles);
  }
}
