import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, AlertCircle, Shuffle } from "lucide-react";
import type { QuizQuestion } from "../types";
import { QuestionManager } from "./QuestionManager";
import { TopicManager } from "./TopicManager";
import { useApp } from "../contexts/AppContext";
import { Button, Card, LoadingSpinner } from "./ui";
import { PageLayout, StaggeredList, FadeIn } from "./layout";

export const QuizAdminPage: React.FC = () => {
  const { topics, questions, generateQuestions, reorderQuestions, isGeneratingQuestions } = useApp();

  // Questions are now managed directly from props, no local state needed

  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!topics.length) {
      setError("Please add at least one topic first.");
      return;
    }

    setError(null);

    try {
      generateQuestions(topics, 5);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error("Error generating questions:", err);
    }
  };

  const handleShuffleQuestions = () => {
    if (!questions.length) {
      setError("No questions to shuffle. Please generate some questions first.");
      return;
    }

    setError(null);

    try {
      // Create a shuffled array of question IDs
      const shuffledIds = [...questions]
        .map(question => question.id)
        .sort(() => Math.random() - 0.5);
      
      reorderQuestions(shuffledIds);
    } catch (err) {
      setError("Failed to shuffle questions. Please try again.");
      console.error("Error shuffling questions:", err);
    }
  };

  return (
    <PageLayout maxWidth="_5xl" center>
      <Card 
        className="content-page admin-page"
        padding="lg"
        shadow="md"
        animate
      >
        <FadeIn direction="down">
          <h2 className="mb-8 text-gray-600 text-3xl text-center">Quiz Game Admin</h2>
        </FadeIn>

        {error && (
          <FadeIn direction="up" delay={0.1}>
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          </FadeIn>
        )}

        <StaggeredList className="space-y-8" staggerDelay={0.2}>
          {/* Topics and AI Generation Combined Section */}
          <div>
            <FadeIn direction="left" delay={0.2}>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Topics & AI Generation</h3>
                <p className="text-gray-600">Add topics and generate questions using AI</p>
              </div>
            </FadeIn>

            <div className="space-y-6">
              <div>
                <TopicManager />
              </div>

              <div className="flex justify-start gap-3">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isGeneratingQuestions || !topics.length}
                  variant="primary"
                  size="md"
                  loading={isGeneratingQuestions}
                  icon={!isGeneratingQuestions ? <Wand2 size={16} /> : undefined}
                >
                  {isGeneratingQuestions ? 'Generating...' : 'Generate Questions'}
                </Button>
                
                <Button
                  onClick={handleShuffleQuestions}
                  disabled={!questions.length}
                  variant="secondary"
                  size="md"
                  icon={<Shuffle size={16} />}
                >
                  Shuffle Questions
                </Button>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <QuestionManager />
          </div>
        </StaggeredList>
      </Card>
    </PageLayout>
  );
};
