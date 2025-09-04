import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useApp } from '../contexts/AppContext';
import { SnapQuizLogo } from './SnapQuizLogo';
import { Button, Input, Card } from './ui';

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
    <Card 
      className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50 text-center max-w-lg w-full mx-auto"
      padding="lg"
      shadow="md"
      animate
    >
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
            <Input
              ref={nameInputRef}
              id="name"
              type="text"
              label="Your Name"
              placeholder="Enter your name"
              value={formName}
              onChange={setFormName}
              error={formName.length > 0 && !isNameValid ? 
                (formName.length < 2 ? 'Name must be at least 2 characters' : 'Name must be 20 characters or less') 
                : undefined
              }
              maxLength={20}
              required
              className="px-6 py-4 text-lg rounded-2xl"
            />
          </motion.div>

          <motion.div 
            className="text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
          >
            <Input
              ref={roomInputRef}
              id="room"
              type="text"
              label="Room Name"
              placeholder="Leave empty to create a new room"
              value={formRoomId || ''}
              onChange={setFormRoomId}
              className="px-6 py-4 text-lg rounded-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
          >
            <Button
              type="submit"
              disabled={!isNameValid}
              variant="primary"
              size="lg"
              fullWidth
              className="px-8 py-4 rounded-2xl text-lg"
            >
              {(formRoomId && formRoomId.trim()) ? 'Join Room' : 'Create Room'}
            </Button>
          </motion.div>
      </motion.form>
    </Card>
  );
};
