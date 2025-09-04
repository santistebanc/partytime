import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const TopicManager: React.FC = () => {
  const { topics, addTopic, removeTopic } = useApp();
  const [newTopic, setNewTopic] = useState('');
  
  const handleAddTopic = () => {
    const trimmedTopic = newTopic.trim();
    if (trimmedTopic && !topics.includes(trimmedTopic)) {
      addTopic(trimmedTopic);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    removeTopic(topicToRemove);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const getTopicColor = (topic: string) => {
    const colors = [
      'bg-yellow-100 text-yellow-800 border-yellow-300',
      'bg-orange-100 text-orange-800 border-orange-300',
      'bg-red-100 text-red-800 border-red-300',
      'bg-teal-100 text-teal-800 border-teal-300',
      'bg-amber-100 text-amber-800 border-amber-300',
      'bg-rose-100 text-rose-800 border-rose-300',
      'bg-cyan-100 text-cyan-800 border-cyan-300',
      'bg-lime-100 text-lime-800 border-lime-300',
    ];
    
    const index = topic.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="topic-manager">
      <div className="topic-input-section">
        <div className="topic-input-container">
          <div className={`topic-tags-display ${topics.length > 0 ? 'has-tags' : ''}`}>
            <AnimatePresence>
              {topics.map((topic) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`topic-tag ${getTopicColor(topic)}`}
                >
                  <span className="topic-name">{topic}</span>
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="btn-remove-topic"
                    title="Remove topic"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={topics.length === 0 ? "Enter a new topic..." : ""}
              className="topic-input-inline"
            />
            {newTopic.trim() && (
              <button
                onClick={handleAddTopic}
                className="btn-add-topic-inline"
                title="Add topic"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
