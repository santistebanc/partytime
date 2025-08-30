import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  User, 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2,
  Play,
  SkipForward,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionEditor } from './QuestionEditor';
import { llmService } from '../services/llmService';
import type { Question } from '../../party/server';

export function Settings() {
  const { user, roomState, updateUser, generateQuestions, updateGameState } = usePartyKit();
  const { currentTheme, setTheme, themes } = useTheme();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpdateDisplayName = () => {
    if (displayName.trim() && displayName !== user?.name) {
      updateUser({ name: displayName.trim() });
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleGenerateQuestions = async () => {
    if (topics.length === 0) return;
    
    setIsGenerating(true);
    try {
      const response = await llmService.generateQuestions({
        topics,
        count: 5,
        difficulty: 'medium'
      });
      
      if (response.success && response.questions.length > 0) {
        // Add new questions to existing ones
        const updatedQuestions = [...roomState.gameState.questions, ...response.questions];
        updateGameState({ questions: updatedQuestions });
      } else {
        console.error('Failed to generate questions:', response.error);
        // Fallback to simple questions
        generateQuestions(topics);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to simple questions
      generateQuestions(topics);
    } finally {
      setIsGenerating(false);
    }
  };



  const startGame = () => {
    if (roomState.gameState.questions.length > 0) {
      updateGameState({ isActive: true, currentQuestionIndex: 0 });
    }
  };

  const nextQuestion = () => {
    updateGameState({ currentQuestionIndex: roomState.gameState.currentQuestionIndex + 1 });
  };

  const resetGame = () => {
    updateGameState({ 
      isActive: false, 
      currentQuestionIndex: 0, 
      currentBuzzer: null,
      history: []
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Display Name */}
      <motion.div
        className="bg-surface p-6 rounded-lg border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <User className="text-primary" size={20} />
          <h2 className="text-xl font-semibold text-text">Display Name</h2>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 px-3 py-2 border border-primary/20 rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter your display name"
          />
          <motion.button
            onClick={handleUpdateDisplayName}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Update
          </motion.button>
        </div>
      </motion.div>

      {/* Theme Selection */}
      <motion.div
        className="bg-surface p-6 rounded-lg border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="text-primary" size={20} />
          <h2 className="text-xl font-semibold text-text">Theme</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <motion.button
              key={theme.name}
              onClick={() => setTheme(theme)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentTheme.name === theme.name
                  ? 'border-primary bg-primary/10'
                  : 'border-primary/20 hover:border-primary/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-text mb-2">{theme.name}</div>
              <div className="flex space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.primary }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.secondary }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.accent }} />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Admin Question Management */}
      {user?.isAdmin && (
        <motion.div
          className="bg-surface p-6 rounded-lg border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-xl font-semibold text-text">Question Management</h2>
          </div>

          {/* Topics Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text mb-2">Topics for Question Generation</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                className="flex-1 px-3 py-2 border border-primary/20 rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Add a topic"
              />
              <motion.button
                onClick={addTopic}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
              </motion.button>
            </div>
            
            {/* Topics Tags */}
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <motion.span
                  key={topic}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary border border-primary/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {topic}
                  <button
                    onClick={() => removeTopic(topic)}
                    className="ml-2 hover:bg-primary/30 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
            </div>

            <motion.button
              onClick={handleGenerateQuestions}
              disabled={topics.length === 0 || isGenerating}
              className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Questions</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Game Controls */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-text mb-3">Game Controls</h3>
            <div className="flex space-x-2">
              <motion.button
                onClick={startGame}
                disabled={!roomState.gameState.questions.length || roomState.gameState.isActive}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={16} className="mr-2" />
                Start Game
              </motion.button>
              <motion.button
                onClick={nextQuestion}
                disabled={!roomState.gameState.isActive}
                className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipForward size={16} className="mr-2" />
                Next Question
              </motion.button>
              <motion.button
                onClick={resetGame}
                className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={16} className="mr-2" />
                Reset Game
              </motion.button>
            </div>
          </div>

          {/* Questions List */}
          <QuestionEditor
            questions={roomState.gameState.questions}
            onUpdateQuestions={(questions) => updateGameState({ questions })}
            isAdmin={user?.isAdmin || false}
          />

          {/* Game History */}
          {roomState.gameState.history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-text mb-3">Game History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {roomState.gameState.history.map((entry, index) => (
                  <div key={index} className="p-3 bg-surface rounded border border-primary/10">
                    <div className="text-sm text-textSecondary mb-1">
                      {entry.player} answered: "{entry.playerAnswer}"
                    </div>
                    <div className="text-sm text-text">
                      Correct: "{entry.correctAnswer}" | 
                      <span className={entry.isCorrect ? 'text-success' : 'text-error'}>
                        {entry.isCorrect ? ' +' : ' -'}{Math.abs(entry.points)} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
