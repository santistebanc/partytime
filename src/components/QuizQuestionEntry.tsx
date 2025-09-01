import React, { useState, useEffect } from 'react';

import { Trash2, Save, X, ChevronDown, Eye } from 'lucide-react';
import type { QuizQuestion } from '../types/quiz';

interface QuizQuestionEntryProps {
  question: QuizQuestion;
  onUpdate: (updatedQuestion: QuizQuestion) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onEditToggle: (id: string) => void;
}

export const QuizQuestionEntry: React.FC<QuizQuestionEntryProps> = ({
  question,
  onUpdate,
  onDelete,
  isEditing,
  onEditToggle,
}) => {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);
  const [showOptions, setShowOptions] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Load revealed state from localStorage on component mount
  useEffect(() => {
    const revealedQuestions = JSON.parse(localStorage.getItem('partytime_revealed_questions') || '{}');
    setIsRevealed(!!revealedQuestions[question.id]);
  }, [question.id]);

  // Save revealed state to localStorage when it changes
  const handleRevealToggle = (revealed: boolean) => {
    setIsRevealed(revealed);
    const revealedQuestions = JSON.parse(localStorage.getItem('partytime_revealed_questions') || '{}');
    if (revealed) {
      revealedQuestions[question.id] = true;
    } else {
      delete revealedQuestions[question.id];
    }
    localStorage.setItem('partytime_revealed_questions', JSON.stringify(revealedQuestions));
  };

  const handleSave = () => {
    onUpdate(editedQuestion);
    onEditToggle(question.id);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    onEditToggle(question.id);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };



  if (isEditing) {
    return (
      <div
        className="quiz-question-entry editing"
      >
        <div className="question-header">
          <div className="question-controls">
            <button
              onClick={handleSave}
              className="btn-save"
              title="Save changes"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="btn-cancel"
              title="Cancel editing"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="question-content">
          <div className="form-group">
            <label>Question:</label>
            <textarea
              value={editedQuestion.question}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
              placeholder="Enter the question..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Correct Answer:</label>
            <input
              type="text"
              value={editedQuestion.answer}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
              placeholder="Enter the correct answer..."
            />
          </div>

          <div className="form-group">
            <label>Options:</label>
            {editedQuestion.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}...`}
                className={option === editedQuestion.answer ? 'correct-answer' : ''}
              />
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Topic:</label>
              <input
                type="text"
                value={editedQuestion.topic}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, topic: e.target.value })}
                placeholder="Enter topic..."
              />
            </div>



            <div className="form-group">
              <label>Points:</label>
              <input
                type="number"
                value={editedQuestion.points}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 10 })}
                min="10"
                max="30"
                step="10"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="quiz-question-entry"
    >
      <div className="question-content">
        <div className="question-main-row">
          <div className="question-text-container">
            <h4 className={`question-text ${!isRevealed ? 'blurred' : ''}`}>
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
                  title={showOptions ? 'Hide options' : 'Show options'}
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
          <div className={`options-list ${showOptions ? 'show' : ''}`}>
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`option ${option === question.answer ? 'correct' : 'incorrect'}`}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
