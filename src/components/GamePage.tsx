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
      className="text-center flex flex-col justify-center items-center flex-1 min-h-full"
    >
      <motion.div 
        className="mb-8 flex justify-center items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      >
        <SnapQuizLogo size='40svh' />
      </motion.div>
      
      <QRCodeSection roomId={roomId} />
    </motion.div>
  );
};
