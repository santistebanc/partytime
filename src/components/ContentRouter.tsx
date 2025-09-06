import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GamePage } from './GamePage';
import { SettingsPage } from './SettingsPage';
import { QuizAdminPage } from './QuizAdminPage';
import { useApp } from '../contexts/AppContext';
import { PageTransition } from './layout';

interface ContentRouterProps {
  currentPage: 'game' | 'settings' | 'admin';
}

export const ContentRouter: React.FC<ContentRouterProps> = ({
  currentPage
}) => {
  const { isAdmin } = useApp();
  
  const renderContent = () => {
    switch (currentPage) {
      case 'game':
        return (
          <GamePage />
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
      <PageTransition currentPage={currentPage}>
        {renderContent()}
      </PageTransition>
    </AnimatePresence>
  );
};
