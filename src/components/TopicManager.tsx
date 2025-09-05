import React from 'react';
import { useApp } from '../contexts/AppContext';
import { TagInput } from './ui';

export const TopicManager: React.FC = () => {
  const { topics, addTopic, removeTopic } = useApp();
  
  const handleTopicsChange = (newTopics: string[]) => {
    // Find added topics
    const addedTopics = newTopics.filter(topic => !topics.includes(topic));
    // Find removed topics
    const removedTopics = topics.filter(topic => !newTopics.includes(topic));
    
    // Add new topics
    addedTopics.forEach(topic => addTopic(topic));
    // Remove deleted topics
    removedTopics.forEach(topic => removeTopic(topic));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topics ({topics.length})
        </label>
        <TagInput
          tags={topics}
          onTagsChange={handleTopicsChange}
          placeholder="Add topics for quiz questions..."
          maxTags={10}
          maxTagLength={30}
          allowDuplicates={false}
          className="w-full"
        />
        <p className="mt-1 text-xs text-gray-500">
          Press Enter or comma to add a topic. Click the X to remove.
        </p>
      </div>
    </div>
  );
};
