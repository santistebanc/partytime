import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface LiveCaptionsProps {
  isActive: boolean;
  transcript: string;
  playerName: string;
  isListening: boolean;
}

export function LiveCaptions({ isActive, transcript, playerName, isListening }: LiveCaptionsProps) {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-surface border border-primary/20 rounded-lg shadow-xl p-4 max-w-2xl w-full">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-full ${
                isListening ? 'bg-primary text-white' : 'bg-surface text-textSecondary'
              }`}>
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  {playerName} is answering...
                </div>
                <div className="text-xs text-textSecondary">
                  {isListening ? 'Listening...' : 'Processing...'}
                </div>
              </div>
            </div>
            
            {transcript && (
              <motion.div
                className="bg-background border border-primary/10 rounded p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-sm text-textSecondary mb-1">Live transcript:</div>
                <div className="text-lg font-medium text-primary">{transcript}</div>
              </motion.div>
            )}
            
            {!transcript && (
              <div className="text-center py-4 text-textSecondary">
                Waiting for {playerName} to speak...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
