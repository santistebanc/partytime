import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useApp } from '../contexts/AppContext';
import { PartytimeLogo } from './PartytimeLogo';

export const Lobby: React.FC = () => {
  const { roomId, userName, navigateToRoom, createRoom } = useApp();
  
  // Form state with priority: URL params → empty
  const [formName, setFormName] = useState(() => {
    return userName || '';
  });
  
  const [formRoomId, setFormRoomId] = useState(() => {
    return roomId || '';
  });
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);

  const isNameValid = formName.length >= 2 && formName.length <= 20;

  useEffect(() => {
    // Auto-focus the name input when component mounts
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) return;
    
    const finalRoomId = (formRoomId || '').trim();
    
    // If room ID is empty, create a new room
    if (!finalRoomId) {
      createRoom(formName);
    } else {
      navigateToRoom(finalRoomId, formName);
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <motion.form 
          onSubmit={handleJoinRoom} 
          className="lobby-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          <motion.div 
            className="name-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          >
            <label htmlFor="name" className="input-label">Your Name</label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={`name-input ${formName.length > 0 ? (isNameValid ? 'valid' : 'invalid') : ''}`}
              maxLength={20}
              required
            />
            {formName.length > 0 && !isNameValid && (
              <motion.div 
                className="name-validation"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {formName.length < 2 ? (
                  <span className="error">Name must be at least 2 characters</span>
                ) : (
                  <span className="error">Name must be 20 characters or less</span>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="room-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          >
            <label htmlFor="room" className="input-label">Room Name</label>
            <input
              ref={roomInputRef}
              id="room"
              type="text"
              placeholder="Leave empty to create a new room"
              value={formRoomId || ''}
              onChange={(e) => setFormRoomId(e.target.value)}
              className="room-input"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={!isNameValid}
            className="btn btn-join"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {(formRoomId && formRoomId.trim()) ? 'Join Room' : 'Create Room'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};
