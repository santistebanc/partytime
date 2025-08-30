import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Mic, 
  MicOff, 
  Trophy, 
  Crown,
  Volume2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import { Confetti } from './Confetti';
import { soundManager } from '../utils/sounds';
import type { Question } from '../../party/server';

export function Game() {
  const { user, roomState, buzzIn, submitAnswer } = usePartyKit();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; points: number; playerName: string } | null>(null);
  const [showWinners, setShowWinners] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = roomState.gameState.questions[roomState.gameState.currentQuestionIndex];
  const isCurrentPlayer = roomState.gameState.currentBuzzer === user?.id;
  const canBuzz = user?.isPlayer && !roomState.gameState.currentBuzzer && roomState.gameState.isActive;

  useEffect(() => {
    if (roomState.gameState.isActive && currentQuestion && user?.isNarrator) {
      speakQuestion(currentQuestion.question);
      // Play game start sound on first question
      if (roomState.gameState.currentQuestionIndex === 0) {
        soundManager.playGameStart();
      }
    }
  }, [roomState.gameState.isActive, currentQuestion, user?.isNarrator, roomState.gameState.currentQuestionIndex]);

  useEffect(() => {
    if (roomState.gameState.currentQuestionIndex >= roomState.gameState.questions.length && roomState.gameState.isActive) {
      setShowWinners(true);
      soundManager.playGameEnd();
    }
  }, [roomState.gameState.currentQuestionIndex, roomState.gameState.questions.length, roomState.gameState.isActive]);

  // Handle answer results from server
  useEffect(() => {
    const lastHistoryEntry = roomState.gameState.history[roomState.gameState.history.length - 1];
    if (lastHistoryEntry && !answerResult) {
      const result = {
        isCorrect: lastHistoryEntry.isCorrect,
        points: lastHistoryEntry.points,
        playerName: lastHistoryEntry.player
      };
      setAnswerResult(result);
      
      // Play sound effect
      if (lastHistoryEntry.isCorrect) {
        soundManager.playCorrect();
      } else {
        soundManager.playIncorrect();
      }
      
      // Auto-hide result after 3 seconds
      setTimeout(() => {
        setAnswerResult(null);
      }, 3000);
    }
  }, [roomState.gameState.history, answerResult]);

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          submitAnswer(transcript.trim());
          setTranscript('');
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleBuzzIn = () => {
    if (canBuzz) {
      buzzIn();
      soundManager.playBuzzer();
    }
  };

  const handleSubmitAnswer = () => {
    if (transcript.trim()) {
      submitAnswer(transcript.trim());
      setTranscript('');
      stopListening();
    }
  };

  const playCorrectSound = () => {
    // Play correct answer sound
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const playWrongSound = () => {
    // Play wrong answer sound
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // Winners screen
  if (showWinners) {
    const sortedUsers = [...roomState.users].sort((a, b) => b.points - a.points);
    const winner = sortedUsers[0];

    return (
      <>
        <Confetti />
        <motion.div 
          className="flex flex-col items-center justify-center h-full text-center p-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        <motion.div
          className="text-6xl font-bold text-accent mb-8"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          🎉
        </motion.div>

        <motion.h1 
          className="text-4xl font-bold text-text mb-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Game Over!
        </motion.h1>

        <motion.div 
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="text-accent" size={32} />
            <span className="text-2xl font-bold text-accent">{winner?.name}</span>
          </div>
          <span className="text-lg text-textSecondary">Winner with {winner?.points} points!</span>
        </motion.div>

        <motion.div 
          className="space-y-2 text-left"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {sortedUsers.slice(1).map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-surface rounded border border-primary/20">
              <span className="text-text">{user.name}</span>
              <span className="text-textSecondary">{user.points} points</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
      </>
    );
  }

  // Game not started
  if (!roomState.gameState.isActive) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-full text-center p-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-8xl font-bold text-primary mb-8"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Partytime
        </motion.div>

        <motion.h2 
          className="text-2xl font-semibold text-text mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Quiz Game
        </motion.h2>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {roomState.users.filter(u => u.isPlayer).map((player, index) => (
            <motion.div
              key={player.id}
              className="p-4 bg-surface border border-primary/20 rounded-lg text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gamepad2 className="text-primary" size={24} />
              </div>
              <span className="text-sm font-medium text-text">{player.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {!roomState.gameState.questions.length && (
          <motion.p 
            className="mt-8 text-textSecondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Admin needs to add questions to start the game
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Game in progress
  return (
    <div className="flex flex-col h-full p-6">
      {/* Question Display */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <span className="text-sm text-textSecondary">
            Question {roomState.gameState.currentQuestionIndex + 1} of {roomState.gameState.questions.length}
          </span>
        </div>
        
        <motion.h2 
          className="text-3xl font-bold text-text mb-4 max-w-4xl mx-auto"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion?.question}
        </motion.h2>

        {currentQuestion && (
          <div className="text-lg text-accent font-medium">
            Worth {currentQuestion.points} points
          </div>
        )}
      </motion.div>

      {/* Buzzer Section */}
      {!roomState.gameState.currentBuzzer && (
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={handleBuzzIn}
            disabled={!canBuzz}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all ${
              canBuzz 
                ? 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            whileHover={canBuzz ? { scale: 1.1 } : {}}
            whileTap={canBuzz ? { scale: 0.9 } : {}}
            animate={canBuzz ? { 
              scale: [1, 1.05, 1],
              boxShadow: ["0 10px 25px rgba(0,0,0,0.2)", "0 20px 40px rgba(0,0,0,0.3)", "0 10px 25px rgba(0,0,0,0.2)"]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            BUZZ!
          </motion.button>
        </motion.div>
      )}

      {/* Current Player Answer Section */}
      {isCurrentPlayer && (
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold text-success mb-2"
              animate={{ 
                color: ['#10b981', '#059669', '#10b981'],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎯 Your turn to answer!
            </motion.div>
            <p className="text-textSecondary">Speak your answer clearly</p>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-full ${
                isListening 
                  ? 'bg-error text-white' 
                  : 'bg-primary text-white'
              } transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </motion.button>

            {isListening && (
              <motion.div 
                className="text-lg text-text"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Listening...
              </motion.div>
            )}
          </div>

          {transcript && (
            <motion.div 
              className="max-w-2xl w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-4 bg-surface border border-primary/20 rounded-lg">
                <p className="text-text mb-2">Your answer:</p>
                <p className="text-lg font-medium text-primary">{transcript}</p>
              </div>
              
              <div className="flex justify-center mt-4 space-x-2">
                <motion.button
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Answer
                </motion.button>
                
                <motion.button
                  onClick={() => setTranscript('')}
                  className="px-6 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Answer Result */}
      <AnimatePresence>
        {answerResult && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
                         <motion.div 
               className="text-center p-8 bg-surface rounded-lg border border-primary/20"
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.5, opacity: 0 }}
             >
               {answerResult.isCorrect ? (
                 <div className="text-success">
                   <CheckCircle size={64} className="mx-auto mb-4" />
                   <h2 className="text-3xl font-bold mb-2">Correct!</h2>
                   <p className="text-xl mb-2">{answerResult.playerName}</p>
                   <p className="text-xl">+{answerResult.points} points</p>
                 </div>
               ) : (
                 <div className="text-error">
                   <XCircle size={64} className="mx-auto mb-4" />
                   <h2 className="text-3xl font-bold mb-2">Incorrect!</h2>
                   <p className="text-xl mb-2">{answerResult.playerName}</p>
                   <p className="text-xl">{answerResult.points} points</p>
                 </div>
               )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
