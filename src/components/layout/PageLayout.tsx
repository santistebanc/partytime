import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  center?: boolean;
  animate?: boolean;
  key?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  padding = 'md',
  maxWidth = 'lg',
  center = false,
  animate = true,
  key,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  
  const centerClass = center ? 'mx-auto' : '';
  
  const classes = `w-full ${paddingClasses[padding]} ${maxWidthClasses[maxWidth]} ${centerClass} ${className}`;
  
  if (animate) {
    return (
      <motion.div
        key={key}
        className={classes}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};
