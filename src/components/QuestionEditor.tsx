import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  GripVertical,
  Save,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { Question } from '../../party/server';

interface QuestionEditorProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  isAdmin: boolean;
}

interface EditableField {
  questionId: string;
  field: 'question' | 'answer' | 'options';
  value: string | string[];
}

export function QuestionEditor({ questions, onUpdateQuestions, isAdmin }: QuestionEditorProps) {
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    onUpdateQuestions(newQuestions);
  };

  const toggleBlur = (questionId: string) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isBlurred: !q.isBlurred } : q
    );
    onUpdateQuestions(updatedQuestions);
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onUpdateQuestions(updatedQuestions);
  };

  const startEditing = (questionId: string, field: 'question' | 'answer' | 'options', currentValue: string | string[]) => {
    setEditingField({ questionId, field, value: currentValue });
    setEditValue(Array.isArray(currentValue) ? currentValue.join('\n') : currentValue);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const updatedQuestions = questions.map(q => {
      if (q.id === editingField.questionId) {
        if (editingField.field === 'options') {
          return { ...q, options: editValue.split('\n').filter(line => line.trim()) };
        } else {
          return { ...q, [editingField.field]: editValue };
        }
      }
      return q;
    });

    onUpdateQuestions(updatedQuestions);
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const EditableField = ({ 
    questionId, 
    field, 
    value, 
    label, 
    isBlurred 
  }: { 
    questionId: string; 
    field: 'question' | 'answer' | 'options'; 
    value: string | string[]; 
    label: string;
    isBlurred: boolean;
  }) => {
    const isEditing = editingField?.questionId === questionId && editingField?.field === field;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">{label}:</label>
          {field === 'options' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-2 border border-primary/20 rounded bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="Enter options (one per line)"
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-2 border border-primary/20 rounded bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={saveEdit}
              className="px-3 py-1 bg-success text-white text-sm rounded hover:bg-success/90 transition-colors flex items-center space-x-1"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-error text-white text-sm rounded hover:bg-error/90 transition-colors flex items-center space-x-1"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between group">
        <div className="flex-1">
          <label className="text-sm font-medium text-text">{label}:</label>
          <div className={`mt-1 ${isBlurred ? 'blur-sm' : ''}`}>
            {field === 'options' ? (
              <div className="space-y-1">
                {Array.isArray(value) ? value.map((option, index) => (
                  <div key={index} className="text-sm text-textSecondary">
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                )) : (
                  <div className="text-sm text-textSecondary">No options</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-textSecondary">{value}</div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditing(questionId, field, value)}
            className="p-1 hover:bg-primary/10 rounded transition-colors"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => toggleBlur(questionId)}
            className="p-1 hover:bg-primary/10 rounded transition-colors"
            title={isBlurred ? "Reveal" : "Hide"}
          >
            {isBlurred ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>
    );
  };

  const QuestionItem = ({ question, index }: { question: Question; index: number }) => {
    return (
      <motion.div
        className="p-4 border border-primary/20 rounded-lg bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-textSecondary">Question {index + 1}</span>
          <div className="flex items-center space-x-2">
            {/* Move Up Button */}
            {index > 0 && (
              <button
                onClick={() => moveQuestion(index, index - 1)}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
            )}
            
            {/* Move Down Button */}
            {index < questions.length - 1 && (
              <button
                onClick={() => moveQuestion(index, index + 1)}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            )}
            
            <button
              onClick={() => toggleBlur(question.id)}
              className="p-1 hover:bg-primary/10 rounded transition-colors"
              title={question.isBlurred ? "Reveal" : "Hide"}
            >
              {question.isBlurred ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={() => removeQuestion(question.id)}
              className="p-1 hover:bg-error/10 rounded transition-colors text-error"
              title="Remove question"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <EditableField
            questionId={question.id}
            field="question"
            value={question.question}
            label="Question"
            isBlurred={question.isBlurred}
          />
          
          <EditableField
            questionId={question.id}
            field="answer"
            value={question.answer}
            label="Answer"
            isBlurred={question.isBlurred}
          />
          
          <EditableField
            questionId={question.id}
            field="options"
            value={question.options}
            label="Options"
            isBlurred={question.isBlurred}
          />
          
          <div className="text-sm text-accent font-medium">
            Points: {question.points}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text mb-3">
        Questions ({questions.length})
      </h3>
      
      {questions.length === 0 ? (
        <div className="text-center py-8 text-textSecondary">
          No questions added yet. Use the generate button above to create some!
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <QuestionItem key={question.id} question={question} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
