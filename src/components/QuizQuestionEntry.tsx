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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className={`text-lg font-medium text-gray-800 ${!isRevealed ? "blur-sm" : ""}`}>
              {question.question}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{question.topic}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{question.points} points</span>
            </div>

            <div className="flex gap-1">
              {!isRevealed ? (
                <button
                  onClick={() => handleRevealToggle(true)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Reveal question"
                >
                  <Eye size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className={`p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${showOptions ? 'rotate-180' : ''}`}
                  title={showOptions ? "Hide options" : "Show options"}
                >
                  <ChevronDown size={16} />
                </button>
              )}

              <button
                onClick={() => onDelete(question.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Delete question"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {isRevealed && (
          <div className={`space-y-2 transition-all duration-300 ${showOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  option === question.answer 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
