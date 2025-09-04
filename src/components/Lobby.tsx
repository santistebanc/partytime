import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useApp } from '../contexts/AppContext';
import { SnapQuizLogo } from './SnapQuizLogo';

export const Lobby: React.FC = () => {
  const { roomId, userName, navigateToRoom, createRoom } = useApp();
  
  // Form state with priority: URL params → localStorage → empty
  const [formName, setFormName] = useState(() => {
    return userName || localStorage.getItem('snapquiz-username') || '';
  });
  
  const [formRoomId, setFormRoomId] = useState(() => {
    console.log('roomId', roomId)
    return roomId || localStorage.getItem('snapquiz-roomname') || '';
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

  // Save username to localStorage whenever it changes
  useEffect(() => {
    if (formName && formName.length >= 2) {
      localStorage.setItem('snapquiz-username', formName);
    }
  }, [formName]);

  // Save room name to localStorage whenever it changes
  useEffect(() => {
    if (formRoomId && formRoomId.trim()) {
      localStorage.setItem('snapquiz-roomname', formRoomId);
    }
  }, [formRoomId]);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50 border border-gray-200 rounded-xl text-center max-w-lg w-full mx-auto shadow-soft">
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        <SnapQuizLogo size='20svh' />
      </motion.div>
      <motion.form 
        onSubmit={handleJoinRoom} 
        className="flex flex-col gap-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
      >
          <motion.div 
            className="text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          >
            <label htmlFor="name" className="block mb-2 font-medium text-gray-600 text-sm">Your Name</label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={`w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl outline-none transition-all duration-300 bg-white text-gray-600 focus:border-blue-500 focus:border-2 ${
                formName.length > 0 ? (isNameValid ? 'border-green-500' : 'border-red-500') : ''
              }`}
              maxLength={20}
              required
            />
            {formName.length > 0 && !isNameValid && (
              <motion.div 
                className="mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {formName.length < 2 ? (
                  <span className="text-red-500 text-sm">Name must be at least 2 characters</span>
                ) : (
                  <span className="text-red-500 text-sm">Name must be 20 characters or less</span>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          >
            <label htmlFor="room" className="block mb-2 font-medium text-gray-600 text-sm">Room Name</label>
            <input
              ref={roomInputRef}
              id="room"
              type="text"
              placeholder="Leave empty to create a new room"
              value={formRoomId || ''}
              onChange={(e) => setFormRoomId(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl outline-none transition-all duration-300 bg-white text-gray-600 focus:border-blue-500 focus:border-2"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={!isNameValid}
            className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl text-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
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
  );
};
