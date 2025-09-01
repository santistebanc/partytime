export interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  options: string[];
  topic: string;
  points: number;
}

export interface QuizTopic {
  id: string;
  name: string;
  color: string;
}

export interface QuizGame {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface AIQuestionRequest {
  topics: string[];
  count: number;
}

export interface AIQuestionResponse {
  questions: Omit<QuizQuestion, 'id'>[];
}

export interface User {
  id: string;
  name: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
}
