import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useRoomContext } from '../contexts/RoomContext';
import { useTopicManagement } from '../hooks/useTopicManagement';

interface TopicManagerProps {}

export const TopicManager: React.FC<TopicManagerProps> = () => {
  const { gameState, socket } = useRoomContext();
  const [newTopic, setNewTopic] = useState('');
  
    // Use the useTopicManagement hook directly
  const { topics, addTopic, deleteTopic } = useTopicManagement(gameState.topics, socket);
  
  const handleAddTopic = () => {
    const trimmedTopic = newTopic.trim();
    if (trimmedTopic && !topics.includes(trimmedTopic)) {
      addTopic(trimmedTopic);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    deleteTopic(topicToRemove);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const getTopicColor = (topic: string) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-green-50 text-green-700 border-green-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-yellow-50 text-yellow-700 border-yellow-200',
      'bg-red-50 text-red-700 border-red-200',
      'bg-teal-50 text-teal-700 border-teal-200',
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

      {topics.length === 0 && (
        <p className="no-topics">No topics added yet. Add some topics to generate questions!</p>
      )}
    </div>
  );
};
