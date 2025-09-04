import React from 'react';
import { motion } from 'framer-motion';

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'transparent';
  minHeight?: 'screen' | 'full' | 'auto';
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className = '',
  background = 'white',
  minHeight = 'screen',
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-transparent',
  };
  
  const minHeightClasses = {
    screen: 'min-h-screen',
    full: 'min-h-full',
    auto: 'min-h-auto',
  };
  
  const classes = `${backgroundClasses[background]} ${minHeightClasses[minHeight]} ${className}`;
  
  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
