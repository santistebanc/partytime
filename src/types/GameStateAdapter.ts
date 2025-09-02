import * as Y from 'yjs';
import type { GameState, User, Question, Round, GameStatus } from './quiz';

// Yjs document structure for GameState
export interface YjsGameState {
  users: Y.Array<Y.Map<any>>;
  connections: Y.Map<string>;
  status: Y.Text;
  topics: Y.Array<string>;
  questions: Y.Array<Y.Map<any>>;
  currentQuestionIndex: Y.Number;
  history: Y.Array<Y.Map<any>>;
  currentRespondent: Y.Text;
  captions: Y.Text;
}

// Helper functions to convert between GameState and Yjs structures
export class GameStateYjsAdapter {
  static createYjsGameState(doc: Y.Doc): YjsGameState {
    return {
      users: doc.getArray('users'),
      connections: doc.getMap('connections'),
      status: doc.getText('status'),
      topics: doc.getArray('topics'),
      questions: doc.getArray('questions'),
      currentQuestionIndex: doc.getNumber('currentQuestionIndex'),
      history: doc.getArray('history'),
      currentRespondent: doc.getText('currentRespondent'),
      captions: doc.getText('captions'),
    };
  }

  static initializeYjsGameState(yjsState: YjsGameState, initialState: GameState): void {
    // Initialize users
    yjsState.users.delete(0, yjsState.users.length);
    initialState.users.forEach(user => {
      const userMap = new Y.Map();
      userMap.set('id', user.id);
      userMap.set('name', user.name);
      userMap.set('isPlayer', user.isPlayer);
      userMap.set('isNarrator', user.isNarrator);
      userMap.set('isAdmin', user.isAdmin);
      yjsState.users.push([userMap]);
    });

    // Initialize connections
    yjsState.connections.clear();
    Object.entries(initialState.connections).forEach(([key, value]) => {
      yjsState.connections.set(key, value);
    });

    // Initialize other fields
    yjsState.status.insert(0, initialState.status);
    yjsState.topics.delete(0, yjsState.topics.length);
    yjsState.topics.insert(0, initialState.topics);
    
    yjsState.questions.delete(0, yjsState.questions.length);
    initialState.questions.forEach(question => {
      const questionMap = new Y.Map();
      questionMap.set('id', question.id);
      questionMap.set('question', question.question);
      questionMap.set('answer', question.answer);
      questionMap.set('options', question.options);
      questionMap.set('topic', question.topic);
      questionMap.set('points', question.points);
      yjsState.questions.push([questionMap]);
    });

    yjsState.currentQuestionIndex.set(initialState.currentQuestionIndex);
    
    yjsState.history.delete(0, yjsState.history.length);
    initialState.history.forEach(round => {
      const roundMap = new Y.Map();
      roundMap.set('buzzQueue', round.buzzQueue);
      roundMap.set('answers', round.answers);
      roundMap.set('pointsAwarded', round.pointsAwarded);
      yjsState.history.push([roundMap]);
    });

    yjsState.currentRespondent.insert(0, initialState.currentRespondent);
    yjsState.captions.insert(0, initialState.captions);
  }

  static yjsToGameState(yjsState: YjsGameState): GameState {
    const users: User[] = yjsState.users.map(userMap => ({
      id: userMap.get('id'),
      name: userMap.get('name'),
      isPlayer: userMap.get('isPlayer'),
      isNarrator: userMap.get('isNarrator'),
      isAdmin: userMap.get('isAdmin'),
    }));

    const connections: Record<string, string> = {};
    yjsState.connections.forEach((value, key) => {
      connections[key] = value;
    });

    const questions: Question[] = yjsState.questions.map(questionMap => ({
      id: questionMap.get('id'),
      question: questionMap.get('question'),
      answer: questionMap.get('answer'),
      options: questionMap.get('options'),
      topic: questionMap.get('topic'),
      points: questionMap.get('points'),
    }));

    const history: Round[] = yjsState.history.map(roundMap => ({
      buzzQueue: roundMap.get('buzzQueue'),
      answers: roundMap.get('answers'),
      pointsAwarded: roundMap.get('pointsAwarded'),
    }));

    return {
      users,
      connections,
      status: yjsState.status.toString() as GameStatus,
      topics: yjsState.topics.toArray(),
      questions,
      currentQuestionIndex: yjsState.currentQuestionIndex.get(),
      history,
      currentRespondent: yjsState.currentRespondent.toString(),
      captions: yjsState.captions.toString(),
    };
  }

  // Helper methods for common operations
  static addUser(yjsState: YjsGameState, user: User): void {
    const userMap = new Y.Map();
    userMap.set('id', user.id);
    userMap.set('name', user.name);
    userMap.set('isPlayer', user.isPlayer);
    userMap.set('isNarrator', user.isNarrator);
    userMap.set('isAdmin', user.isAdmin);
    yjsState.users.push([userMap]);
  }

  static removeUser(yjsState: YjsGameState, userId: string): void {
    const index = yjsState.users.findIndex(userMap => userMap.get('id') === userId);
    if (index !== -1) {
      yjsState.users.delete(index, 1);
    }
  }

  static updateUser(yjsState: YjsGameState, userId: string, updates: Partial<User>): void {
    const userMap = yjsState.users.find(userMap => userMap.get('id') === userId);
    if (userMap) {
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          userMap.set(key, value);
        }
      });
    }
  }

  static addQuestion(yjsState: YjsGameState, question: Question): void {
    const questionMap = new Y.Map();
    questionMap.set('id', question.id);
    questionMap.set('question', question.question);
    questionMap.set('answer', question.answer);
    questionMap.set('options', question.options);
    questionMap.set('topic', question.topic);
    questionMap.set('points', question.points);
    yjsState.questions.push([questionMap]);
  }

  static updateQuestion(yjsState: YjsGameState, questionId: string, updates: Partial<Question>): void {
    const questionMap = yjsState.questions.find(q => q.get('id') === questionId);
    if (questionMap) {
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          questionMap.set(key, value);
        }
      });
    }
  }

  static deleteQuestion(yjsState: YjsGameState, questionId: string): void {
    const index = yjsState.questions.findIndex(q => q.get('id') === questionId);
    if (index !== -1) {
      yjsState.questions.delete(index, 1);
    }
  }

  static reorderQuestions(yjsState: YjsGameState, questionIds: string[]): void {
    const reorderedQuestions: Y.Map<any>[] = [];
    questionIds.forEach(id => {
      const questionMap = yjsState.questions.find(q => q.get('id') === id);
      if (questionMap) {
        reorderedQuestions.push(questionMap);
      }
    });
    yjsState.questions.delete(0, yjsState.questions.length);
    yjsState.questions.insert(0, reorderedQuestions);
  }

  static addTopic(yjsState: YjsGameState, topic: string): void {
    if (!yjsState.topics.includes(topic)) {
      yjsState.topics.push([topic]);
    }
  }

  static removeTopic(yjsState: YjsGameState, topic: string): void {
    const index = yjsState.topics.indexOf(topic);
    if (index !== -1) {
      yjsState.topics.delete(index, 1);
    }
  }

  static setGameStatus(yjsState: YjsGameState, status: GameStatus): void {
    yjsState.status.delete(0, yjsState.status.length);
    yjsState.status.insert(0, status);
  }

  static setCurrentQuestionIndex(yjsState: YjsGameState, index: number): void {
    yjsState.currentQuestionIndex.set(index);
  }

  static setCurrentRespondent(yjsState: YjsGameState, userId: string): void {
    yjsState.currentRespondent.delete(0, yjsState.currentRespondent.length);
    yjsState.currentRespondent.insert(0, userId);
  }

  static setCaptions(yjsState: YjsGameState, captions: string): void {
    yjsState.captions.delete(0, yjsState.captions.length);
    yjsState.captions.insert(0, captions);
  }

  static addRound(yjsState: YjsGameState, round: Round): void {
    const roundMap = new Y.Map();
    roundMap.set('buzzQueue', round.buzzQueue);
    roundMap.set('answers', round.answers);
    roundMap.set('pointsAwarded', round.pointsAwarded);
    yjsState.history.push([roundMap]);
  }
}
