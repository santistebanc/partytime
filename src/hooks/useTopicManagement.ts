import { useState, useCallback } from 'react';

export const useTopicManagement = (initialTopics: string[], socket: any) => {
  const [topics, setTopics] = useState<string[]>(initialTopics);

  const addTopic = useCallback((topic: string) => {
    if (topic.trim() && !topics.includes(topic.trim())) {
      const newTopics = [...topics, topic.trim()];
      setTopics(newTopics);
      
      // Send to server
      if (socket) {
        socket.send(JSON.stringify({
          type: 'addTopic',
          topic: topic.trim()
        }));
      }
    }
  }, [topics, socket]);

  const deleteTopic = useCallback((topicToDelete: string) => {
    const newTopics = topics.filter(topic => topic !== topicToDelete);
    setTopics(newTopics);
    
    // Send to server
    if (socket) {
      socket.send(JSON.stringify({
        type: 'deleteTopic',
        topic: topicToDelete
      }));
    }
  }, [topics, socket]);

  const handleTopicsChange = useCallback((newTopics: string[]) => {
    // Handle topic changes from TopicManager
    const addedTopics = newTopics.filter(topic => !topics.includes(topic));
    const removedTopics = topics.filter(topic => !newTopics.includes(topic));
    
    addedTopics.forEach(topic => addTopic(topic));
    removedTopics.forEach(topic => deleteTopic(topic));
  }, [topics, addTopic, deleteTopic]);

  const updateTopics = useCallback((newTopics: string[]) => {
    setTopics(newTopics);
  }, []);

  return {
    topics,
    addTopic,
    deleteTopic,
    handleTopicsChange,
    updateTopics
  };
};
