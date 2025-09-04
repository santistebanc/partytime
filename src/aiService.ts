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

    const prompt = this.buildPrompt(request.topics, request.count, request.existingQuestions);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert quiz question generator. Generate engaging, educational multiple-choice questions with exactly 4 options where only one is correct. You are excellent at creating unique, non-repetitive questions and following instructions precisely.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000,
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

      const aiResponse = this.parseAIResponse(content);
      
      // Validate and fix topics
      const validatedQuestions = aiResponse.questions.map((question: any) => ({
        ...question,
        topic: this.validateTopic(question.topic, request.topics)
      }));
      
      return {
        questions: validatedQuestions
      };
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions. Please try again.');
    }
  }

  private buildPrompt(topics: string[], count: number, existingQuestions: any[] = []): string {
    const topicsList = topics.join(', ');
    
    let existingQuestionsText = '';
    if (existingQuestions.length > 0) {
      existingQuestionsText = `

EXISTING QUESTIONS (DO NOT REPEAT THESE):
${existingQuestions.map((q, i) => `${i + 1}. ${q.question} (Answer: ${q.answer})`).join('\n')}

CRITICAL REQUIREMENTS:
- Do NOT create questions that are similar to any of the existing questions above
- Do NOT test the same knowledge points or concepts as existing questions
- Do NOT use similar wording, phrasing, or question structures
- Each new question must be completely unique and test different aspects of the topics
- If you're unsure whether a question is too similar, create a different one instead`;
    }

    return `Generate ${count} multiple-choice quiz questions using the following topics: ${topicsList}.${existingQuestionsText}

For each question:
1. MANDATORY: Select EXACTLY ONE topic from this list: ${topicsList}
2. Create a clear, engaging question about that SPECIFIC topic that requires knowledge and critical thinking
3. Provide the correct answer
4. Provide three plausible but incorrect options that could reasonably be chosen
5. Assign points based on difficulty (10 points for easy, 20 points for medium, 30 points for hard). Aim for moderate to high difficulty on average - prefer medium and hard questions over easy ones. Most questions should be 20 or 30 points.
6. CRITICAL: The "topic" field MUST be EXACTLY one of these topics: ${topicsList} - do not create new topics or variations

Format the response as JSON:
{
  "questions": [
    {
      "question": "What is...?",
      "answer": "Correct answer",
      "options": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"],
      "topic": "EXACT_TOPIC_FROM_LIST_ABOVE",
      "points": 30
    }
  ]
}

TOPIC VALIDATION: Each "topic" field must be EXACTLY one of: ${topicsList}

Important: Each question should use a DIFFERENT topic from the list, and topics should be distributed randomly across the questions. Make sure the questions are educational, engaging, and appropriate for a general audience. Remember to maintain moderate to high difficulty on average, with most questions being 20 or 30 points.

${existingQuestions.length > 0 ? `FINAL WARNING: You MUST create completely original questions that are NOT similar to any existing questions. Review each question you generate against the existing questions list. If there's any doubt about uniqueness, generate a different question. Quality and uniqueness are more important than quantity.` : ''}`;
  }

  private validateTopic(assignedTopic: string, validTopics: string[]): string {
    // Check if the assigned topic is exactly in the valid topics list
    if (validTopics.includes(assignedTopic)) {
      return assignedTopic;
    }
    
    // Try to find a close match (case-insensitive)
    const lowerAssigned = assignedTopic.toLowerCase().trim();
    const lowerValid = validTopics.map(t => t.toLowerCase().trim());
    
    for (let i = 0; i < lowerValid.length; i++) {
      if (lowerAssigned === lowerValid[i]) {
        return validTopics[i]; // Return the original case version
      }
    }
    
    // Try partial matching for common variations
    for (let i = 0; i < lowerValid.length; i++) {
      if (lowerAssigned.includes(lowerValid[i]) || lowerValid[i].includes(lowerAssigned)) {
        return validTopics[i];
      }
    }
    
    // If no match found, default to the first topic and log a warning
    console.warn(`Topic validation failed: "${assignedTopic}" not found in valid topics [${validTopics.join(', ')}]. Using first topic as fallback.`);
    return validTopics[0];
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
