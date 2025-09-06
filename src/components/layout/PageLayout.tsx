import React from 'react';
import { motion } from 'framer-motion';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '_2xl' | '_3xl' | '_4xl' | '_5xl' | '_6xl' | '_7xl' | 'full';
  center?: boolean;
  animate?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  padding = 'md',
  maxWidth = 'lg',
  center = false,
  animate = true,
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
    _2xl: 'max-w-2xl',
    _3xl: 'max-w-3xl',
    _4xl: 'max-w-4xl',
    _5xl: 'max-w-5xl',
    _6xl: 'max-w-6xl',
    _7xl: 'max-w-7xl',
    full: 'max-w-full',
  };
  
  const centerClass = center ? 'mx-auto' : '';
  
  const classes = `w-full ${paddingClasses[padding]} ${maxWidthClasses[maxWidth]} ${centerClass} ${className}`;
  
  if (animate) {
    return (
      <motion.div
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
