import type { Question } from '../../party/server';

export interface LLMQuestionRequest {
  topics: string[];
  count: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface LLMQuestionResponse {
  questions: Question[];
  success: boolean;
  error?: string;
}

// This is a placeholder service that can be easily replaced with real LLM API calls
export class LLMService {
  private static instance: LLMService;
  
  private constructor() {}
  
  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  async generateQuestions(request: LLMQuestionRequest): Promise<LLMQuestionResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample questions based on topics
      const questions: Question[] = [];
      const { topics, count } = request;
      
      // Sample question templates for different topics
      const questionTemplates = [
        {
          question: "What is the capital of {topic}?",
          answer: "The capital of {topic} is {answer}",
          options: ["Option A", "Option B", "Option C", "Option D"],
          points: 10
        },
        {
          question: "Which famous landmark is located in {topic}?",
          answer: "The famous landmark in {topic} is {answer}",
          options: ["Landmark A", "Landmark B", "Landmark C", "Landmark D"],
          points: 15
        },
        {
          question: "What is the main language spoken in {topic}?",
          answer: "The main language in {topic} is {answer}",
          options: ["Language A", "Language B", "Language C", "Language D"],
          points: 12
        },
        {
          question: "Who is a famous person from {topic}?",
          answer: "A famous person from {topic} is {answer}",
          options: ["Person A", "Person B", "Person C", "Person D"],
          points: 8
        },
        {
          question: "What is the traditional food of {topic}?",
          answer: "The traditional food of {topic} is {answer}",
          options: ["Food A", "Food B", "Food C", "Food D"],
          points: 14
        }
      ];

      for (let i = 0; i < count; i++) {
        const template = questionTemplates[i % questionTemplates.length];
        const topic = topics[i % topics.length];
        
        // Generate unique ID
        const id = `q_${Date.now()}_${i}`;
        
        // Create question with topic substitution
        const question: Question = {
          id,
          question: template.question.replace('{topic}', topic),
          answer: template.answer.replace('{topic}', topic).replace('{answer}', 'Sample Answer'),
          options: template.options.map((opt, index) => 
            opt.replace('Option', `${String.fromCharCode(65 + index)}`)
          ),
          points: template.points + Math.floor(Math.random() * 5),
          isBlurred: true // Questions start blurred
        };
        
        questions.push(question);
      }

      return {
        questions,
        success: true
      };
      
    } catch (error) {
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async evaluateAnswer(question: string, userAnswer: string, correctAnswer: string): Promise<{
    isCorrect: boolean;
    confidence: number;
    feedback: string;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple evaluation logic (can be replaced with real LLM evaluation)
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();
      
      // Check for exact match
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        return {
          isCorrect: true,
          confidence: 1.0,
          feedback: "Perfect answer! Well done!"
        };
      }
      
      // Check for partial matches
      const userWords = normalizedUserAnswer.split(/\s+/);
      const correctWords = normalizedCorrectAnswer.split(/\s+/);
      const matchingWords = userWords.filter(word => 
        correctWords.some(correctWord => 
          correctWord.includes(word) || word.includes(correctWord)
        )
      );
      
      const similarity = matchingWords.length / Math.max(userWords.length, correctWords.length);
      
      if (similarity > 0.7) {
        return {
          isCorrect: true,
          confidence: similarity,
          feedback: "Close enough! Good answer!"
        };
      } else if (similarity > 0.4) {
        return {
          isCorrect: false,
          confidence: similarity,
          feedback: "You're on the right track, but not quite there."
        };
      } else {
        return {
          isCorrect: false,
          confidence: similarity,
          feedback: "That's not quite right. Try again!"
        };
      }
      
    } catch (error) {
      return {
        isCorrect: false,
        confidence: 0,
        feedback: "Unable to evaluate answer. Please try again."
      };
    }
  }
}

export const llmService = LLMService.getInstance();
