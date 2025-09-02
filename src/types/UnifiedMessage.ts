// Unified message type for all state changes
export interface UnifiedMessage {
  type: 'stateChange';
  action: StateChangeAction;
  payload: any;
  userId?: string;
  timestamp?: number;
}

// All possible state change actions
export type StateChangeAction = 
  | 'join'
  | 'leave' 
  | 'changeName'
  | 'generateQuestions'
  | 'addQuestion'
  | 'updateQuestion'
  | 'deleteQuestion'
  | 'reorderQuestions'
  | 'addTopic'
  | 'removeTopic'
  | 'updateRevealState'
  | 'updateUserToggles'
  | 'setGameStatus'
  | 'setCurrentQuestionIndex'
  | 'setCurrentRespondent'
  | 'setCaptions'
  | 'addRound';

// Payload types for each action
export interface JoinPayload {
  name: string;
  userId: string;
}

export interface LeavePayload {
  userId: string;
}

export interface ChangeNamePayload {
  oldName: string;
  newName: string;
  userId: string;
}

export interface GenerateQuestionsPayload {
  topics: string[];
  count: number;
}

export interface AddQuestionPayload {
  question: any;
}

export interface UpdateQuestionPayload {
  question: any;
}

export interface DeleteQuestionPayload {
  questionId: string;
}

export interface ReorderQuestionsPayload {
  questionIds: string[];
}

export interface AddTopicPayload {
  topic: string;
}

export interface RemoveTopicPayload {
  topic: string;
}

export interface UpdateRevealStatePayload {
  questionId: string;
  revealed: boolean;
}

export interface UpdateUserTogglesPayload {
  userId: string;
  isPlayer?: boolean;
  isNarrator?: boolean;
  isAdmin?: boolean;
}

export interface SetGameStatusPayload {
  status: string;
}

export interface SetCurrentQuestionIndexPayload {
  index: number;
}

export interface SetCurrentRespondentPayload {
  userId: string;
}

export interface SetCaptionsPayload {
  captions: string;
}

export interface AddRoundPayload {
  round: any;
}

// Response message type
export interface StateUpdateResponse {
  type: 'stateUpdate';
  state: any; // GameState
  action?: StateChangeAction;
  success: boolean;
  error?: string;
  timestamp: number;
}
