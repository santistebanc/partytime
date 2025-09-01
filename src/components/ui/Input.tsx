import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'input';
  const variantClasses = {
    default: 'input-default',
    filled: 'input-filled',
    outlined: 'input-outlined'
  };
  const sizeClasses = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  };
  const stateClasses = error ? 'input-error' : '';

  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${className}`.trim();

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <motion.input
        id={inputId}
        className={inputClasses}
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        {...(props as any)}
      />
      {error && (
        <motion.span
          className="input-error-text"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.span>
      )}
      {helperText && !error && (
        <span className="input-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};
