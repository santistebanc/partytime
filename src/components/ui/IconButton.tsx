import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
  animate?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  title,
  animate = true,
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-300 disabled:text-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500',
    ghost: 'bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200',
  };
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  const disabledClass = disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${className}`;
  
  const buttonContent = (
    <>
      {loading && (
        <div className="loading-spinner loading-sm" />
      )}
      {!loading && icon}
    </>
  );
  
  if (animate) {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        className={classes}
        title={title}
        whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {buttonContent}
      </motion.button>
    );
  }
  
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      title={title}
    >
      {buttonContent}
    </button>
  );
});
