import { useCallback } from 'react';
import { useUnifiedMessage } from './useUnifiedMessage';

export const useTopicManagement = (topics: string[], socket: any) => {
  const { addTopic: addTopicUnified, removeTopic } = useUnifiedMessage(socket);

  const addTopic = useCallback((topic: string) => {
    if (topic.trim() && !topics.includes(topic.trim())) {
      // Send to server - no local state update needed
      addTopicUnified(topic.trim());
    }
  }, [topics, addTopicUnified]);

  const deleteTopic = useCallback((topicToDelete: string) => {
    // Send to server - no local state update needed
    removeTopic(topicToDelete);
  }, [removeTopic]);

  const handleTopicsChange = useCallback((newTopics: string[]) => {
    // Handle topic changes from TopicManager
    const addedTopics = newTopics.filter(topic => !topics.includes(topic));
    const removedTopics = topics.filter(topic => !newTopics.includes(topic));
    
    addedTopics.forEach(topic => addTopic(topic));
    removedTopics.forEach(topic => deleteTopic(topic));
  }, [topics, addTopic, deleteTopic]);

  return {
    topics,
    addTopic,
    deleteTopic,
    handleTopicsChange
  };
};
