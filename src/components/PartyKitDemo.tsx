import React, { useState } from 'react';
import { useYPartyKitRoomContext } from '../contexts/YPartyKitRoomContext';
import { generateId } from '../utils';

export const YPartyKitDemo: React.FC = () => {
  const {
    gameState,
    isConnected,
    currentUserId,
    addQuestion,
    addTopic,
    removeTopic,
    setGameStatus,
    setCurrentQuestionIndex,
  } = useYPartyKitRoomContext();

  const [newTopic, setNewTopic] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      addTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      addQuestion({
        id: generateId(),
        question: newQuestion.trim(),
        answer: 'Sample answer',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        topic: 'Demo',
        points: 10,
      });
      setNewQuestion('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    removeTopic(topic);
  };

  const handleSetGameStatus = (status: string) => {
    setGameStatus(status);
  };

  const handleSetQuestionIndex = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Y-PartyKit Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Current User ID:</strong> {currentUserId}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Game Status:</strong> {gameState.status}
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => handleSetGameStatus('unstarted')}>Unstarted</button>
          <button onClick={() => handleSetGameStatus('running')}>Running</button>
          <button onClick={() => handleSetGameStatus('await-next')}>Await Next</button>
          <button onClick={() => handleSetGameStatus('finished')}>Finished</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Current Question Index:</strong> {gameState.currentQuestionIndex}
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => handleSetQuestionIndex(0)}>0</button>
          <button onClick={() => handleSetQuestionIndex(1)}>1</button>
          <button onClick={() => handleSetQuestionIndex(2)}>2</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Users ({gameState.users.length}):</strong>
        <ul>
          {gameState.users.map(user => (
            <li key={user.id}>
              {user.name} (ID: {user.id})
              {user.isAdmin && ' 👑'}
              {user.isNarrator && ' 🎭'}
              {user.isPlayer && ' 🎮'}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Topics ({gameState.topics.length}):</strong>
        <ul>
          {gameState.topics.map(topic => (
            <li key={topic}>
              {topic}
              <button 
                onClick={() => handleRemoveTopic(topic)}
                style={{ marginLeft: '10px', fontSize: '12px' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add new topic"
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleAddTopic}>Add Topic</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Questions ({gameState.questions.length}):</strong>
        <ul>
          {gameState.questions.map(question => (
            <li key={question.id}>
              {question.question} (Topic: {question.topic}, Points: {question.points})
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add new question"
            style={{ marginRight: '10px', width: '300px' }}
          />
          <button onClick={handleAddQuestion}>Add Question</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>History ({gameState.history.length} rounds):</strong>
        <ul>
          {gameState.history.map((round, index) => (
            <li key={index}>
              Round {index + 1}: {round.answers.length} answers
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Current Respondent:</strong> {gameState.currentRespondent || 'None'}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Captions:</strong> {gameState.captions || 'None'}
      </div>
    </div>
  );
};
