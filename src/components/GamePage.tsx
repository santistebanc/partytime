import React from 'react';
import { motion } from 'framer-motion';
import { SnapQuizLogo } from './SnapQuizLogo';
import { QRCodeSection } from './QRCodeSection';

interface GamePageProps {
  roomId: string;
}

export const GamePage: React.FC<GamePageProps> = ({
  roomId
}) => {
  return (
    <motion.div 
      key="game"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="content-page game-page"
    >
      <div className="game-content">
        <motion.div 
          className="snapquiz-logo"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="logo-container"
          >
            <SnapQuizLogo size='40svh' />
          </motion.div>
        </motion.div>
        
        <QRCodeSection 
          roomId={roomId}
        />
      </div>
    </motion.div>
  );
};
