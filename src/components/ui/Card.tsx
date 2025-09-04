import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  animate?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  animate = false,
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  const classes = `bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${hoverClass} ${className}`;
  
  if (animate) {
    return (
      <motion.div
        className={classes}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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