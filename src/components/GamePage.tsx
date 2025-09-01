import React from 'react';
import { motion } from 'framer-motion';
import { PartytimeLogo } from './PartytimeLogo';
import { QRCodeSection } from './QRCodeSection';

interface GamePageProps {
  roomId: string;
  showCopiedMessage: boolean;
  onCopyMessage: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({
  roomId,
  showCopiedMessage,
  onCopyMessage
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
          className="partytime-logo"
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
            <PartytimeLogo size={180} />
          </motion.div>
        </motion.div>
        
        <QRCodeSection 
          roomId={roomId}
          showCopiedMessage={showCopiedMessage}
          onCopyMessage={onCopyMessage}
        />
      </div>
    </motion.div>
  );
};
