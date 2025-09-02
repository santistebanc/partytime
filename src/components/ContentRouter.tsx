import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GamePage } from './GamePage';
import { SettingsPage } from './SettingsPage';
import { QuizAdminPage } from './QuizAdminPage';
import { useNavigation } from '../hooks/useNavigation';
import { useRoomContext } from '../contexts/RoomContext';

interface ContentRouterProps {
  currentPage: 'game' | 'settings' | 'admin';
}

export const ContentRouter: React.FC<ContentRouterProps> = ({
  currentPage
}) => {
  const { roomId, userName } = useNavigation();
  const { isPlayer, isNarrator, isAdmin } = useRoomContext();
  
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
    <div className="content-panel">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};
