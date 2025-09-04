import React from 'react';
import { motion } from 'framer-motion';

export interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
  origin?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.4,
  scale = 0.8,
  className = '',
  origin = 'center',
}) => {
  const originVariants = {
    center: { transformOrigin: 'center' },
    top: { transformOrigin: 'top' },
    bottom: { transformOrigin: 'bottom' },
    left: { transformOrigin: 'left' },
    right: { transformOrigin: 'right' },
  };
  
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        scale,
        ...originVariants[origin]
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
};
