import type * as Party from "partykit/server";
import { UserManager } from "./UserManager";
import { QuizManager } from "./QuizManager";

export class MessageHandler {
  constructor(
    private userManager: UserManager,
    private quizManager: QuizManager,
    private room: Party.Room
  ) {}

  // Helper method to send messages without manually calling JSON.stringify
  private sendMessage(connection: Party.Connection, message: any): void {
    connection.send(JSON.stringify(message));
  }

  // Helper method to broadcast messages to all connections
  private broadcastMessage(message: any): void {
    this.room.broadcast(JSON.stringify(message));
  }

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

    // Load user toggles from storage for every user joining
    await this.userManager.loadUserTogglesFromStorage();
    
    // Check if this user already exists
    const existingUser = this.userManager.getUser(data.userId);
    if (existingUser) {
      console.log(
        `User ${data.name} (${data.userId}) adding new connection to room ${this.room.id}`
      );
      
      // Restore user toggle states from storage
      const storedToggles = this.userManager.getUserToggles(data.userId);
      if (storedToggles) {
        this.userManager.updateUserToggles(data.userId, storedToggles);
      }
    } else {
      // New user joining
      const isFirstUser = this.userManager.isFirstUser();
      this.userManager.addUser(data.userId, data.name, isFirstUser);
      
      // Save to room storage
      await this.userManager.saveUserTogglesToStorage();
      
      console.log(
        `New user ${data.name} (${data.userId}) joined room ${this.room.id}`
      );

      // Generate initial questions if this is the first user and questions haven't been generated yet
      if (isFirstUser && !this.quizManager.hasQuestions()) {
        await this.quizManager.generateInitialQuestions();
      }
    }

    // Send current questions to the joining user (if any exist)
    const currentQuestions = await this.quizManager.getQuestions();
    if (currentQuestions.length > 0) {
      this.sendMessage(sender, {
        type: "questions",
        questions: currentQuestions,
      });
      console.log(
        `Sent ${currentQuestions.length} existing questions to joining user`
      );
    }

    // Send current topics to the joining user (if any exist)
    const currentTopics = await this.quizManager.getTopics();
    if (currentTopics.length > 0) {
      this.sendMessage(sender, {
        type: "topics",
        topics: currentTopics,
      });
      console.log(
        `Sent ${currentTopics.length} existing topics to joining user`
      );
    }

    // Store connection mapping
    this.userManager.addConnection(sender.id, data.userId);

    console.log(
      `Total users in room: ${this.userManager.getUserCount()}, total connections: ${this.userManager.getConnectionCount()}`
    );

    // Send confirmation to the user with their toggle states
    const userToggles = this.userManager.getUserToggles(data.userId);
    this.sendMessage(sender, {
      type: "joined",
      userId: data.userId,
      roomId: this.room.id,
      userToggles: userToggles || {
        isPlayer: true,
        isNarrator: false,
        isAdmin: this.userManager.getUserCount() === 1
      }
    });

    // Broadcast updated user list to ALL users in the room
    this.broadcastUsers();
  }

  private async handleLeave(
    data: { userId: string },
    sender: Party.Connection
  ): Promise<void> {
    this.userManager.removeUser(data.userId);
    this.userManager.removeConnection(sender.id);
    this.broadcastUsers();

    this.sendMessage(sender, {
      type: "left",
      userId: data.userId,
    });
  }

  private async handleNameChange(
    data: { oldName: string; newName: string; userId: string },
    sender: Party.Connection
  ): Promise<void> {
    console.log(`User ${data.oldName} changing name to ${data.newName}`);

    // Update the user's name in our local state
    const success = this.userManager.updateUserName(data.userId, data.newName);
    if (success) {
      console.log(
        `Name updated for user ${data.userId}: ${data.oldName} -> ${data.newName}`
      );

      // Broadcast the name change to all users in the room
      this.broadcastMessage({
        type: "nameChanged",
        userId: data.userId,
        oldName: data.oldName,
        newName: data.newName,
      });

      // Also broadcast updated user list
      this.broadcastUsers();
    } else {
      console.error(`User ${data.userId} not found for name change`);
    }
  }

  private async handleGenerateQuestions(
    data: any,
    sender: Party.Connection
  ): Promise<void> {
    // This would integrate with AI service
    console.log("AI question generation requested");
  }

  private async handleAddQuestion(
    data: { question: any },
    sender: Party.Connection
  ): Promise<void> {
    await this.quizManager.addQuestion(data.question);
    console.log("Question added:", data.question.id);
  }

  private async handleUpdateQuestion(
    data: { question: any },
    sender: Party.Connection
  ): Promise<void> {
    const success = await this.quizManager.updateQuestion(data.question);
    if (success) {
      console.log("Question updated:", data.question.id);
    } else {
      console.error("Question not found for update:", data.question.id);
    }
  }

  private async handleDeleteQuestion(
    data: { questionId: string },
    sender: Party.Connection
  ): Promise<void> {
    const success = await this.quizManager.deleteQuestion(data.questionId);
    if (success) {
      console.log("Question deleted:", data.questionId);
    } else {
      console.error("Question not found for deletion:", data.questionId);
    }
  }

  private async handleReorderQuestions(
    data: { questionIds: string[] },
    sender: Party.Connection
  ): Promise<void> {
    await this.quizManager.reorderQuestions(data.questionIds);
    console.log("Questions reordered");
  }

  private async handleGetQuestions(sender: Party.Connection): Promise<void> {
    const questions = await this.quizManager.getQuestions();
    this.sendMessage(sender, {
      type: "questions",
      questions,
    });
  }

  private async handleAddTopic(
    data: { topic: string },
    sender: Party.Connection
  ): Promise<void> {
    await this.quizManager.addTopic(data.topic);
    console.log("Topic added:", data.topic);
  }

  private async handleRemoveTopic(
    data: { topic: string },
    sender: Party.Connection
  ): Promise<void> {
    const success = await this.quizManager.removeTopic(data.topic);
    if (success) {
      console.log("Topic removed:", data.topic);
    } else {
      console.error("Topic not found for removal:", data.topic);
    }
  }

  private async handleGetTopics(sender: Party.Connection): Promise<void> {
    const topics = await this.quizManager.getTopics();
    this.sendMessage(sender, {
      type: "topics",
      topics,
    });
  }

  private async handleUpdateRevealState(
    data: { questionId: string; revealed: boolean },
    sender: Party.Connection
  ): Promise<void> {
    await this.quizManager.setRevealState(data.questionId, data.revealed);
    
    // Broadcast the reveal state update to all users
    this.broadcastMessage({
      type: "revealStateUpdated",
      questionId: data.questionId,
      revealed: data.revealed,
    });
    
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

    const success = this.userManager.updateUserToggles(data.userId, toggles);
    if (success) {
      await this.userManager.saveUserTogglesToStorage();
      console.log(`User toggles updated for ${data.userId}:`, toggles);
      
      // Broadcast updated user list
      this.broadcastUsers();
    } else {
      console.error(`User ${data.userId} not found for toggle update`);
    }
  }

  private broadcastUsers(): void {
    const usersList = this.userManager.getAllUsersWithToggles();

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
