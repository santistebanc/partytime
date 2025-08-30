import React from 'react';
import { 
  Users, 
  Gamepad2, 
  MessageCircle, 
  Settings, 
  LogIn, 
  LogOut,
  Copy,
  HelpCircle
} from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import { motion } from 'framer-motion';

interface HeaderProps {
  onToggleFriends: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  showFriends: boolean;
}

export function Header({ onToggleFriends, onNavigate, currentPage, showFriends }: HeaderProps) {
  const { roomId, user, party } = usePartyKit();

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const handleJoinExit = () => {
    if (party) {
      party.close();
    }
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-surface border-b border-primary/20 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onToggleFriends}
            className={`p-2 rounded-lg transition-colors ${
              showFriends 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-primary/10 text-text'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Friends List (F)"
          >
            <Users size={20} />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-text transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Keyboard Shortcuts"
            onClick={() => {
              alert(`Keyboard Shortcuts:
• 1 or G: Go to Game
• 2 or C: Go to Chat  
• 3 or S: Go to Settings
• F: Toggle Friends List
• Spacebar: Buzz In (when playing)`);
            }}
          >
            <HelpCircle size={20} />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => onNavigate('game')}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 'game' 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-primary/10 text-text'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Game (1 or G)"
          >
            <Gamepad2 size={20} />
          </motion.button>

          <motion.button
            onClick={() => onNavigate('chat')}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 'chat' 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-primary/10 text-text'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Chat (2 or C)"
          >
            <MessageCircle size={20} />
          </motion.button>

          <motion.button
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 'settings' 
                ? 'bg-primary text-white' 
                : 'bg-surface hover:bg-primary/10 text-text'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings (3 or S)"
          >
            <Settings size={20} />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          {roomId && (
            <motion.div 
              className="flex items-center space-x-2 bg-surface px-3 py-1 rounded-lg border border-primary/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm text-textSecondary">Room:</span>
              <span className="text-sm font-mono text-primary">{roomId}</span>
              <motion.button
                onClick={copyRoomId}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy size={14} />
              </motion.button>
            </motion.div>
          )}

          <motion.button
            onClick={handleJoinExit}
            className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {party ? <LogOut size={20} /> : <LogIn size={20} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
