import React, { useState, useEffect } from "react";

import { Trash2, Save, X, ChevronDown, Eye } from "lucide-react";
import type { QuizQuestion } from "../types";

interface QuizQuestionEntryProps {
  question: QuizQuestion;
  onDelete: (id: string) => void;
  isRevealed: boolean;
  onRevealToggle: (questionId: string, revealed: boolean) => void;
}

export const QuizQuestionEntry: React.FC<QuizQuestionEntryProps> = ({
  question,
  onDelete,
  isRevealed,
  onRevealToggle,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Handle reveal toggle through parent component
  const handleRevealToggle = (revealed: boolean) => {
    onRevealToggle(question.id, revealed);
  };

  return (
    <div className="quiz-question-entry">
      <div className="question-content">
        <div className="question-main-row">
          <div className="question-text-container">
            <h4 className={`question-text ${!isRevealed ? "blurred" : ""}`}>
              {question.question}
            </h4>
          </div>

          <div className="question-actions">
            <div className="question-meta">
              <span className="topic-badge">{question.topic}</span>
              <span className="points-badge">{question.points} points</span>
            </div>

            <div className="action-buttons">
              {!isRevealed ? (
                <button
                  onClick={() => handleRevealToggle(true)}
                  className="btn-reveal-question"
                  title="Reveal question"
                >
                  <Eye size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="btn-toggle-options"
                  title={showOptions ? "Hide options" : "Show options"}
                >
                  <ChevronDown size={16} />
                </button>
              )}

              <button
                onClick={() => onDelete(question.id)}
                className="btn-delete"
                title="Delete question"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {isRevealed && (
          <div className={`options-list ${showOptions ? "show" : ""}`}>
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`option ${
                  option === question.answer ? "correct" : "incorrect"
                }`}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
