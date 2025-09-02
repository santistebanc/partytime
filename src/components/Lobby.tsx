import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation, getStoredUserName, getStoredRoomId } from '../contexts/NavigationContext';
import { useNavigation as useNavigationHook } from '../hooks/useNavigation';
import { PartytimeLogo } from './PartytimeLogo';
import { generateRoomId } from '../utils';

export const Lobby: React.FC = () => {
  const { roomId: urlRoomId, userName: urlUserName } = useNavigation();
  const { navigateToRoom } = useNavigationHook();
  
  // Get stored values for prefilling (but don't navigate automatically)
  const storedUserName = getStoredUserName();
  const storedRoomId = getStoredRoomId();
  
  // Initialize with stored values, but query params take priority
  const [name, setName] = useState((urlUserName || storedUserName || ''));
  const [roomId, setRoomId] = useState((urlRoomId || storedRoomId || ''));
  const nameInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);

  const isNameValid = name.length >= 2 && name.length <= 20;

  // Prefill inputs from URL params or localStorage
  useEffect(() => {
    // Query params take priority
    if (urlUserName) {
      setName(urlUserName);
    } else if (storedUserName) {
      setName(storedUserName);
    }
    
    if (urlRoomId) {
      setRoomId(urlRoomId);
    } else if (storedRoomId) {
      setRoomId(storedRoomId);
    }
  }, [urlUserName, urlRoomId, storedUserName, storedRoomId]);

  useEffect(() => {
    // Auto-focus the name input when component mounts
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) return;
    
    let finalRoomId = (roomId || '').trim();
    
    // If room ID is empty, generate a random one
    if (!finalRoomId) {
      finalRoomId = generateRoomId();
    }
    
    navigateToRoom(finalRoomId, name);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`name-input ${name.length > 0 ? (isNameValid ? 'valid' : 'invalid') : ''}`}
              maxLength={20}
              required
            />
            {name.length > 0 && !isNameValid && (
              <motion.div 
                className="name-validation"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {name.length < 2 ? (
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
              value={roomId || ''}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-input"
            />
            <motion.div 
              className="room-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Leave empty to create a new room, or enter an existing room name to join
            </motion.div>
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
            {(roomId && roomId.trim()) ? 'Join Room' : 'Create Room'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};
