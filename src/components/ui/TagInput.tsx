import React, { useState, useRef, KeyboardEvent, FocusEvent } from 'react';
import { X } from 'lucide-react';

export interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
  maxTagLength?: number;
  allowDuplicates?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add topics...',
  className = '',
  disabled = false,
  maxTags,
  maxTagLength = 50,
  allowDuplicates = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) return;
    
    // Check max length
    if (trimmedTag.length > maxTagLength) return;
    
    // Check max tags
    if (maxTags && tags.length >= maxTags) return;
    
    // Check duplicates
    if (!allowDuplicates && tags.includes(trimmedTag)) return;
    
    onTagsChange([...tags, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Add tag on blur if there's input
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const isAtMaxTags = maxTags ? tags.length >= maxTags : false;

  return (
    <div
      className={`
        relative w-full min-h-[42px] px-3 py-2 border rounded-lg
        transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${isFocused ? 'border-blue-500' : 'border-gray-300'}
        ${className}
      `}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-wrap gap-1 items-center min-h-[26px]">
        {/* Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isAtMaxTags ? `Maximum ${maxTags} topics` : placeholder}
          disabled={disabled || isAtMaxTags}
          className={`
            flex-1 min-w-[120px] outline-none bg-transparent
            ${disabled || isAtMaxTags ? 'cursor-not-allowed text-gray-400' : 'text-gray-900'}
            placeholder-gray-400
          `}
        />
      </div>
    </div>
  );
};
