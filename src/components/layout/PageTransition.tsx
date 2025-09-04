import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PageTransitionProps {
  children: React.ReactNode;
  currentPage: string;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  currentPage,
  className = '',
  mode = 'wait',
}) => {
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={currentPage}
        className={className}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
