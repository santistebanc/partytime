import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, getStoredUserName, getStoredRoomId } from '../contexts/NavigationContext';

interface LobbyProps {
  onNavigateToRoom: (roomId: string, userName: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onNavigateToRoom }) => {
  const { roomId: urlRoomId, userName: urlUserName } = useNavigation();
  
  // Get stored values for prefilling (but don't navigate automatically)
  const storedUserName = getStoredUserName();
  const storedRoomId = getStoredRoomId();
  
  // Initialize with stored values, but query params take priority
  const [name, setName] = useState(urlUserName || storedUserName || '');
  const [roomId, setRoomId] = useState(urlRoomId || storedRoomId || '');
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
    
    let finalRoomId = roomId.trim();
    
    // If room ID is empty, generate a random one
    if (!finalRoomId) {
      finalRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    onNavigateToRoom(finalRoomId, name);
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <h1 className="lobby-title">Welcome to Partytime!</h1>
        
        <form onSubmit={handleJoinRoom} className="lobby-form">
          <div className="name-section">
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
              <div className="name-validation">
                {name.length < 2 ? (
                  <span className="error">Name must be at least 2 characters</span>
                ) : (
                  <span className="error">Name must be 20 characters or less</span>
                )}
              </div>
            )}
          </div>

          <div className="room-section">
            <label htmlFor="room" className="input-label">Room Name</label>
            <input
              ref={roomInputRef}
              id="room"
              type="text"
              placeholder="Leave empty to create a new room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="room-input"
            />
            <div className="room-hint">
              Leave empty to create a new room, or enter an existing room name to join
            </div>
          </div>

          <button
            type="submit"
            disabled={!isNameValid}
            className="btn btn-join"
          >
            {roomId.trim() ? 'Join Room' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};
