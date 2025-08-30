import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { FriendsList } from './FriendsList';
import { Chat } from './Chat';
import { Settings } from './Settings';
import { Game } from './Game';
import { RoomJoin } from './RoomJoin';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { usePartyKit } from '../hooks/usePartyKit';
import { ThemeProvider } from '../contexts/ThemeContext';

export function App() {
  const [currentPage, setCurrentPage] = useState('game');
  const [showFriends, setShowFriends] = useState(false);
  const { user, roomId, createRoom, joinRoom } = usePartyKit();

  useEffect(() => {
    // Auto-create room if none exists
    if (!roomId) {
      createRoom();
    }
  }, [roomId, createRoom]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Hide friends panel when navigating
    setShowFriends(false);
  };

  const toggleFriends = () => {
    setShowFriends(!showFriends);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <Chat />;
      case 'settings':
        return <Settings />;
      case 'game':
      default:
        return <Game />;
    }
  };

  // Loading state
  if (!user) {
    return (
      <ThemeProvider>
        <RoomJoin />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <KeyboardShortcuts
          onNavigate={handleNavigate}
          onToggleFriends={toggleFriends}
        />
        
        <Header
          onToggleFriends={toggleFriends}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          showFriends={showFriends}
        />
        
        <FriendsList isVisible={showFriends} />
        
        <main className={`transition-all duration-300 ${
          showFriends ? 'ml-80' : 'ml-0'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-4rem)]"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ThemeProvider>
  );
}
