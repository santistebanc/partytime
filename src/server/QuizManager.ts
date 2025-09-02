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

  // Utility Methods
  getQuestionCount(): number {
    return (this.room.storage as any).quizQuestions?.length || 0;
  }

  getTopicCount(): number {
    return (this.room.storage as any).topics?.length || 0;
  }
}
