import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GamePage } from './GamePage';
import { SettingsPage } from './SettingsPage';
import { QuizAdminPage } from './QuizAdminPage';
import type { QuizQuestion } from '../types/quiz';

interface ContentRouterProps {
  currentPage: 'game' | 'settings' | 'admin';
  roomId: string;
  userName: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  initialQuestions: QuizQuestion[];
  initialTopics: string[];
  revealState: Record<string, boolean>;
  socket: any;
  onNameChange: (newName: string) => void;
  onPlayerToggle: (value: boolean) => void;
  onNarratorToggle: (value: boolean) => void;
  onAdminToggle: (value: boolean) => void;
}

export const ContentRouter: React.FC<ContentRouterProps> = ({
  currentPage,
  roomId,
  userName,
  isPlayer,
  isNarrator,
  isAdmin,
  initialQuestions,
  initialTopics,
  revealState,
  socket,
  onNameChange,
  onPlayerToggle,
  onNarratorToggle,
  onAdminToggle
}) => {
  const renderContent = () => {
    switch (currentPage) {
      case 'game':
        return (
          <GamePage 
            roomId={roomId}
          />
        );
      
      case 'settings':
        return (
          <SettingsPage
            userName={userName}
            isPlayer={isPlayer}
            isNarrator={isNarrator}
            isAdmin={isAdmin}
            onNameChange={onNameChange}
            onPlayerToggle={onPlayerToggle}
            onNarratorToggle={onNarratorToggle}
            onAdminToggle={onAdminToggle}
          />
        );
      
      case 'admin':
        if (!isAdmin) {
          return null;
        }
        return (
          <QuizAdminPage 
            initialQuestions={initialQuestions} 
            initialTopics={initialTopics} 
            socket={socket}
            revealState={revealState}
          />
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
