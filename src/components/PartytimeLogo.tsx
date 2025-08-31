import React from 'react';

interface PartytimeLogoProps {
  size?: number;
  className?: string;
}

export const PartytimeLogo: React.FC<PartytimeLogoProps> = ({ size = 120, className = '' }) => {
  return (
    <div 
      className={`partytime-logo-text ${className}`}
      style={{ fontSize: `${size * 0.4}px` }}
    >
      <span className="logo-party">Party</span>
      <span className="logo-time">time</span>
    </div>
  );
};
