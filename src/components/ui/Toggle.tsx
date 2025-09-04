import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
  id,
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={toggleId}
          className={`toggle-slider ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </div>
      {label && (
        <label 
          htmlFor={toggleId}
          className={`text-sm font-medium text-gray-700 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
