import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "../types";
import { QuestionManager } from "./QuestionManager";
import { TopicManager } from "./TopicManager";
import { useApp } from "../contexts/AppContext";
import { Button, Card, LoadingSpinner } from "./ui";
import { PageLayout, StaggeredList, FadeIn } from "./layout";

export const QuizAdminPage: React.FC = () => {
  const { topics, generateQuestions } = useApp();

  // Questions are now managed directly from props, no local state needed

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!topics.length) {
      setError("Please add at least one topic first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      generateQuestions(topics, 5);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setIsGenerating(false);
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

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating || !topics.length}
                  variant="primary"
                  size="md"
                  loading={isGenerating}
                  icon={!isGenerating ? <Wand2 size={16} /> : undefined}
                >
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
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
