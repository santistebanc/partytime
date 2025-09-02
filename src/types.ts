export interface Question {
  id: string;
  question: string;
  answer: string;
  options: string[];
  topic: string;
  points: number;
}

export type GameStatus = "unstarted" | "running" | "await-next" | "finished";

export interface Answer {
  user: string; // userId
  answerGiven: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Round {
  buzzQueue: string[]; // userIds in order of buzz
  answers: Answer[];
  pointsAwarded: Record<string, number>; // userId -> points
}

export interface GameState {
  users: User[];
  connections: Record<string, string>; // connectionId -> userId
  status: GameStatus;
  topics: string[];
  questions: Question[];
  currentQuestionIndex: number;
  history: Round[];
  currentRespondent: string; // userId
  captions: string;
}

export interface User {
  id: string;
  name: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
}

// Legacy types for backward compatibility
export interface QuizQuestion extends Question {}
export interface AIQuestionRequest {
  topics: string[];
  count: number;
  existingQuestions?: Question[];
}
export interface AIQuestionResponse {
  questions: Omit<Question, 'id'>[];
}
