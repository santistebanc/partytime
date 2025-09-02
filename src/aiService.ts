import type { AIQuestionRequest, AIQuestionResponse } from './types';

export class AIService {
  private static instance: AIService;
  private apiKey: string;

  private constructor() {
    // In PartyKit, environment variables are available on the server
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateQuizQuestions(request: AIQuestionRequest): Promise<AIQuestionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
    }

    const prompt = this.buildPrompt(request.topics, request.count);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a quiz question generator. Generate engaging, educational multiple-choice questions with exactly 4 options where only one is correct.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  }

  private buildPrompt(topics: string[], count: number): string {
    const topicsList = topics.join(', ');
    return `Generate ${count} multiple-choice quiz questions using the following topics: ${topicsList}.

For each question:
1. Randomly select ONE topic from the list above
2. Create a clear, engaging question about that topic that requires knowledge and critical thinking
3. Provide the correct answer
4. Provide three plausible but incorrect options that could reasonably be chosen
5. Assign points based on difficulty (10 points for easy, 20 points for medium, 30 points for hard). Aim for moderate to high difficulty on average - prefer medium and hard questions over easy ones. Most questions should be 20 or 30 points.
6. Use the selected topic as the topic tag

Format the response as JSON:
{
  "questions": [
    {
      "question": "What is...?",
      "answer": "Correct answer",
      "options": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"],
      "topic": "selected_topic_from_list",
      "points": 30,

    }
  ]
}

Important: Each question should use a DIFFERENT topic from the list, and topics should be distributed randomly across the questions. Make sure the questions are educational, engaging, and appropriate for a general audience. Remember to maintain moderate to high difficulty on average, with most questions being 20 or 30 points.`;
  }

  private parseAIResponse(content: string): AIQuestionResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format');
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}

export const aiService = AIService.getInstance();
