import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GamePage } from './GamePage';
import { SettingsPage } from './SettingsPage';
import { QuizAdminPage } from './QuizAdminPage';
import { useApp } from '../contexts/AppContext';

interface ContentRouterProps {
  currentPage: 'game' | 'settings' | 'admin';
}

export const ContentRouter: React.FC<ContentRouterProps> = ({
  currentPage
}) => {
  const { roomId, userName, isPlayer, isNarrator, isAdmin } = useApp();
  
  // Ensure roomId and userName are strings (they should be since we're in Room component)
  const roomIdStr = roomId || '';
  const userNameStr = userName || '';
  const renderContent = () => {
    switch (currentPage) {
      case 'game':
        return (
          <GamePage 
            roomId={roomIdStr}
          />
        );
      
      case 'settings':
        return (
          <SettingsPage />
        );
      
      case 'admin':
        if (!isAdmin) {
          return null;
        }
        return (
          <QuizAdminPage />
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
};
