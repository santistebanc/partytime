import type * as Party from "partykit/server";
import type { AIQuestionRequest } from "./types/quiz";
import { aiService } from "./aiService";

interface User {
  id: string;
  name: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  options: string[];
  topic: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

export default class RoomServer implements Party.Server {
  private users: Map<string, User> = new Map();
  private connections: Map<string, string> = new Map(); // connectionId -> userId
  private questionsGenerated = false;

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Connection established, but user needs to send join message
    console.log(`User connected to room ${this.room.id}`);
  }

  async onMessage(message: string, sender: Party.Connection) {
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
      }
    } catch (error) {
      console.error("Error handling message:", error);
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
        console.log(
          `User ${userId} has no more active connections, removing from room`
        );
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
    console.log("handleJoin", data, sender);

    // Check if this user already exists
    const existingUser = this.users.get(data.userId);
    if (existingUser) {
      console.log(
        `User ${data.name} (${data.userId}) adding new connection to room ${this.room.id}`
      );
    } else {
      // New user joining
      const user: User = {
        id: data.userId,
        name: data.name,
      };
      this.users.set(data.userId, user);
      console.log(
        `New user ${data.name} (${data.userId}) joined room ${this.room.id}`
      );

      // Generate initial questions if this is the first user and questions haven't been generated yet
      if (this.users.size === 1 && !this.questionsGenerated) {
        this.generateInitialQuestions();
      }
    }

    // Send current questions to the joining user (if any exist)
    const currentQuestions = (this.room.storage as any).quizQuestions || [];
    if (currentQuestions.length > 0) {
      sender.send(
        JSON.stringify({
          type: "questions",
          questions: currentQuestions,
        })
      );
      console.log(
        `Sent ${currentQuestions.length} existing questions to joining user`
      );
    }

    // Send current topics to the joining user (if any exist)
    const currentTopics = (this.room.storage as any).topics || [];
    if (currentTopics.length > 0) {
      sender.send(
        JSON.stringify({
          type: "topics",
          topics: currentTopics,
        })
      );
      console.log(
        `Sent ${currentTopics.length} existing topics to joining user`
      );
    }

    // Store connection mapping
    this.connections.set(sender.id, data.userId);

    console.log(
      `Total users in room: ${this.users.size}, total connections: ${this.connections.size}`
    );

    // Send confirmation to the user
    sender.send(
      JSON.stringify({
        type: "joined",
        userId: data.userId,
        roomId: this.room.id,
      })
    );

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

    sender.send(
      JSON.stringify({
        type: "left",
        userId: data.userId,
      })
    );
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
      console.log(
        `Name updated for user ${data.userId}: ${data.oldName} -> ${data.newName}`
      );

      // Broadcast the name change to all users in the room
      this.room.broadcast(
        JSON.stringify({
          type: "nameChanged",
          userId: data.userId,
          oldName: data.oldName,
          newName: data.newName,
        })
      );

      // Also broadcast updated user list
      this.broadcastUsers();
    } else {
      console.error(`User ${data.userId} not found for name change`);
    }
  }

  private broadcastUsers() {
    const usersList = Array.from(this.users.values());

    console.log(`Broadcasting users list: ${usersList.length} users`);
    console.log(
      "Users:",
      usersList.map((u) => `${u.name} (${u.id})`)
    );

    // Broadcast to all connections except the one that just joined
    this.room.broadcast(
      JSON.stringify({
        type: "users",
        users: usersList,
      })
    );
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

  private generateInitialQuestions() {
    console.log(
      "Setting hardcoded initial questions and topics for the room..."
    );

    // Initialize default topics
    const defaultTopics = ["Science", "History", "Geography", "Pop Culture"];
    (this.room.storage as any).topics = defaultTopics;
    console.log(`Set ${defaultTopics.length} default topics in room storage`);

    // Hardcoded questions with moderate to high difficulty
    const questions: QuizQuestion[] = [
      {
        id: crypto.randomUUID(),
        question: "What is the capital of Australia?",
        answer: "Canberra",
        options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        topic: "Geography",
        points: 20,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "Which element has the chemical symbol 'Fe'?",
        answer: "Iron",
        options: ["Iron", "Fluorine", "Francium", "Fermium"],
        topic: "Science",
        points: 30,
        difficulty: "hard",
      },
      {
        id: crypto.randomUUID(),
        question: "In which year did World War II end?",
        answer: "1945",
        options: ["1943", "1944", "1945", "1946"],
        topic: "History",
        points: 20,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "Who wrote 'Romeo and Juliet'?",
        answer: "William Shakespeare",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Jane Austen",
          "Mark Twain",
        ],
        topic: "Literature",
        points: 30,
        difficulty: "hard",
      },
      {
        id: crypto.randomUUID(),
        question: "What is the largest planet in our solar system?",
        answer: "Jupiter",
        options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
        topic: "Science",
        points: 20,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "Which country is home to the kangaroo?",
        answer: "Australia",
        options: ["New Zealand", "Australia", "South Africa", "Brazil"],
        topic: "Geography",
        points: 20,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "What is the square root of 144?",
        answer: "12",
        options: ["10", "11", "12", "13"],
        topic: "Mathematics",
        points: 30,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "Who painted the Mona Lisa?",
        answer: "Leonardo da Vinci",
        options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
        topic: "Art",
        points: 30,
        difficulty: "hard",
      },
      {
        id: crypto.randomUUID(),
        question: "What is the main component of the sun?",
        answer: "Hydrogen",
        options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
        topic: "Science",
        points: 20,
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "Which language has the most native speakers worldwide?",
        answer: "Mandarin Chinese",
        options: ["English", "Spanish", "Mandarin Chinese", "Hindi"],
        topic: "General Knowledge",
        points: 30,
        difficulty: "hard",
      },
    ];

    // Store in room storage
    (this.room.storage as any).quizQuestions = questions;
    this.questionsGenerated = true;
    console.log(`Set ${questions.length} hardcoded questions in room storage`);

    // Broadcast questions to all users in the room
    this.broadcastQuestions();
  }

  private broadcastQuestions() {
    const questions = (this.room.storage as any).quizQuestions || [];
    this.room.broadcast(
      JSON.stringify({
        type: "questions",
        questions: questions,
      })
    );
    console.log(`Broadcasted ${questions.length} questions to all users`);
  }

  private async handleGenerateQuestions(
    data: { topics: string[] },
    sender: Party.Connection
  ) {
    try {
      const response = await aiService.generateQuizQuestions({
        topics: data.topics,
        count: 5,
      });

      // Add generated questions to storage
      const currentQuestions = (this.room.storage as any).quizQuestions || [];
      const newQuestions = response.questions.map((q) => ({
        ...q,
        id: crypto.randomUUID(),
      }));

      (this.room.storage as any).quizQuestions = [
        ...currentQuestions,
        ...newQuestions,
      ];

      // Broadcast updated questions
      this.broadcastQuestions();

      sender.send(
        JSON.stringify({
          type: "questionsGenerated",
          questions: newQuestions,
        })
      );
    } catch (error) {
      console.error("Error generating questions:", error);
      sender.send(
        JSON.stringify({
          type: "questionsGenerationError",
          error: "Failed to generate questions",
        })
      );
    }
  }

  private async handleAddQuestion(
    data: { question: QuizQuestion },
    sender: Party.Connection
  ) {
    const newQuestion = { ...data.question, id: crypto.randomUUID() };
    const currentQuestions = (this.room.storage as any).quizQuestions || [];
    (this.room.storage as any).quizQuestions = [
      ...currentQuestions,
      newQuestion,
    ];

    console.log(`Added new question: ${newQuestion.question}`);
    this.broadcastQuestions();
  }

  private async handleUpdateQuestion(
    data: { question: QuizQuestion },
    sender: Party.Connection
  ) {
    const currentQuestions = (this.room.storage as any).quizQuestions || [];
    const index = currentQuestions.findIndex(
      (q: QuizQuestion) => q.id === data.question.id
    );
    if (index !== -1) {
      currentQuestions[index] = data.question;
      (this.room.storage as any).quizQuestions = currentQuestions;
      console.log(`Updated question: ${data.question.question}`);
      this.broadcastQuestions();
    }
  }

  private async handleDeleteQuestion(
    data: { questionId: string },
    sender: Party.Connection
  ) {
    const currentQuestions = (this.room.storage as any).quizQuestions || [];
    const index = currentQuestions.findIndex(
      (q: QuizQuestion) => q.id === data.questionId
    );
    if (index !== -1) {
      currentQuestions.splice(index, 1);
      (this.room.storage as any).quizQuestions = currentQuestions;
      console.log(`Deleted question with ID: ${data.questionId}`);
      this.broadcastQuestions();
    }
  }

  private async handleReorderQuestions(
    data: { questionIds: string[] },
    sender: Party.Connection
  ) {
    const currentQuestions = (this.room.storage as any).quizQuestions || [];

    // Reorder questions based on the new order
    const newOrder: QuizQuestion[] = [];
    for (const id of data.questionIds) {
      const question = currentQuestions.find((q: QuizQuestion) => q.id === id);
      if (question) {
        newOrder.push(question);
      }
    }

    if (newOrder.length === currentQuestions.length) {
      (this.room.storage as any).quizQuestions = newOrder;
      console.log(`Reordered ${newOrder.length} questions`);
      this.broadcastQuestions();
    }
  }

  private async handleGetQuestions(sender: Party.Connection) {
    const questions = (this.room.storage as any).quizQuestions || [];
    sender.send(
      JSON.stringify({
        type: "questions",
        questions: questions,
      })
    );
    console.log(`Sent ${questions.length} questions to user`);
  }

  private async handleAddTopic(
    data: { topic: string },
    sender: Party.Connection
  ) {
    const currentTopics = (this.room.storage as any).topics || [];
    if (!currentTopics.includes(data.topic)) {
      const newTopics = [...currentTopics, data.topic];
      (this.room.storage as any).topics = newTopics;
      console.log(`Added new topic: ${data.topic}`);
      this.broadcastTopics();
    }
  }

  private async handleRemoveTopic(
    data: { topic: string },
    sender: Party.Connection
  ) {
    const currentTopics = (this.room.storage as any).topics || [];
    const index = currentTopics.indexOf(data.topic);
    if (index !== -1) {
      currentTopics.splice(index, 1);
      (this.room.storage as any).topics = currentTopics;
      console.log(`Removed topic: ${data.topic}`);
      this.broadcastTopics();
    }
  }

  private async handleGetTopics(sender: Party.Connection) {
    const topics = (this.room.storage as any).topics || [];
    sender.send(
      JSON.stringify({
        type: "topics",
        topics: topics,
      })
    );
    console.log(`Sent ${topics.length} topics to user`);
  }

  private broadcastTopics() {
    const topics = (this.room.storage as any).topics || [];
    this.room.broadcast(
      JSON.stringify({
        type: "topics",
        topics: topics,
      })
    );
    console.log(`Broadcasted ${topics.length} topics to all users`);
  }
}

RoomServer satisfies Party.Worker;
