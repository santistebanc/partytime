import type * as Party from "partykit/server";
import { generateId } from "../utils";

export interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  options: string[];
  topic: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

export class QuizManager {
  private questionsGenerated = false;

  constructor(private room: Party.Room) {}

  // Question Management
  async getQuestions(): Promise<QuizQuestion[]> {
    return (this.room.storage as any).quizQuestions || [];
  }

  async addQuestion(question: QuizQuestion): Promise<void> {
    const questions = await this.getQuestions();
    questions.push(question);
    (this.room.storage as any).quizQuestions = questions;
  }

  async updateQuestion(updatedQuestion: QuizQuestion): Promise<boolean> {
    const questions = await this.getQuestions();
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    
    if (index !== -1) {
      questions[index] = updatedQuestion;
      (this.room.storage as any).quizQuestions = questions;
      return true;
    }
    return false;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const questions = await this.getQuestions();
    const filteredQuestions = questions.filter(q => q.id !== questionId);
    
    if (filteredQuestions.length !== questions.length) {
      (this.room.storage as any).quizQuestions = filteredQuestions;
      return true;
    }
    return false;
  }

  async reorderQuestions(questionIds: string[]): Promise<void> {
    const questions = await this.getQuestions();
    const reorderedQuestions: QuizQuestion[] = [];
    
    for (const id of questionIds) {
      const question = questions.find(q => q.id === id);
      if (question) {
        reorderedQuestions.push(question);
      }
    }
    
    (this.room.storage as any).quizQuestions = reorderedQuestions;
  }

  // Reveal State Management
  async getRevealState(): Promise<Record<string, boolean>> {
    return (this.room.storage as any).revealState || {};
  }

  async setRevealState(questionId: string, revealed: boolean): Promise<void> {
    const revealState = await this.getRevealState();
    if (revealed) {
      revealState[questionId] = true;
    } else {
      delete revealState[questionId];
    }
    (this.room.storage as any).revealState = revealState;
  }

  // Topic Management
  async getTopics(): Promise<string[]> {
    return (this.room.storage as any).topics || [];
  }

  async addTopic(topic: string): Promise<void> {
    const topics = await this.getTopics();
    if (!topics.includes(topic)) {
      topics.push(topic);
      (this.room.storage as any).topics = topics;
    }
  }

  async removeTopic(topic: string): Promise<boolean> {
    const topics = await this.getTopics();
    const filteredTopics = topics.filter(t => t !== topic);
    
    if (filteredTopics.length !== topics.length) {
      (this.room.storage as any).topics = filteredTopics;
      return true;
    }
    return false;
  }

  // Initial Questions Generation
  async generateInitialQuestions(): Promise<void> {
    if (this.questionsGenerated) {
      return;
    }

    console.log("Setting hardcoded initial questions and topics for the room...");

    // Initialize default topics
    const defaultTopics = ["Science", "History", "Geography", "Pop Culture"];
    (this.room.storage as any).topics = defaultTopics;
    console.log(`Set ${defaultTopics.length} default topics in room storage`);

    // Hardcoded questions with moderate to high difficulty
    const questions: QuizQuestion[] = [
      {
        id: generateId(),
        question: "What is the capital of Australia?",
        answer: "Canberra",
        options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        topic: "Geography",
        points: 20,
        difficulty: "easy",
      },
      {
        id: generateId(),
        question: "Which element has the chemical symbol 'Fe'?",
        answer: "Iron",
        options: ["Iron", "Fluorine", "Francium", "Fermium"],
        topic: "Science",
        points: 30,
        difficulty: "medium",
      },
      {
        id: generateId(),
        question: "In which year did World War II end?",
        answer: "1945",
        options: ["1943", "1944", "1945", "1946"],
        topic: "History",
        points: 20,
        difficulty: "easy",
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
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "What is the largest planet in our solar system?",
        answer: "Jupiter",
        options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
        topic: "Science",
        points: 20,
        difficulty: "easy",
      },
      {
        id: crypto.randomUUID(),
        question: "Which country is home to the kangaroo?",
        answer: "Australia",
        options: ["New Zealand", "Australia", "South Africa", "Brazil"],
        topic: "Geography",
        points: 20,
        difficulty: "easy",
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
        difficulty: "medium",
      },
      {
        id: crypto.randomUUID(),
        question: "What is the main component of the sun?",
        answer: "Hydrogen",
        options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
        topic: "Science",
        points: 20,
        difficulty: "easy",
      },
      {
        id: crypto.randomUUID(),
        question: "Which planet is known as the Red Planet?",
        answer: "Mars",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        topic: "Science",
        points: 20,
        difficulty: "easy",
      }
    ];

    (this.room.storage as any).quizQuestions = questions;
    this.questionsGenerated = true;
    
    console.log(`Generated ${questions.length} initial questions`);
  }

  // Utility Methods
  hasQuestions(): boolean {
    return this.questionsGenerated;
  }

  getQuestionCount(): number {
    return (this.room.storage as any).quizQuestions?.length || 0;
  }

  getTopicCount(): number {
    return (this.room.storage as any).topics?.length || 0;
  }
}
