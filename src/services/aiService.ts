import type { AIQuestionRequest, AIQuestionResponse } from '../types/quiz';

export class AIService {
  private static instance: AIService;
  private socket: WebSocket | null = null;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setSocket(socket: WebSocket) {
    this.socket = socket;
  }

  public async generateQuizQuestions(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection not available');
    }

    return new Promise((resolve, reject) => {
      // Create a unique request ID to match response
      const requestId = crypto.randomUUID();
      
      // Set up response handler
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'questionsGenerated') {
            this.socket?.removeEventListener('message', handleMessage);
            resolve({ questions: data.questions });
          } else if (data.type === 'questionsGenerationError') {
            this.socket?.removeEventListener('message', handleMessage);
            reject(new Error(data.error));
          }
        } catch (error) {
          // Ignore non-JSON messages
        }
      };

      this.socket!.addEventListener('message', handleMessage);

      // Send request to server
      this.socket!.send(JSON.stringify({
        type: 'generateQuestions',
        ...request
      }));

      // Set timeout for request
      setTimeout(() => {
        this.socket?.removeEventListener('message', handleMessage);
        reject(new Error('Request timeout - no response from server'));
      }, 30000); // 30 second timeout
    });
  }
}

export const aiService = AIService.getInstance();
