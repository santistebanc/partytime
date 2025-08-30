import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Plus, Copy, Check } from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import { LoadingSpinner } from './LoadingSpinner';

export function RoomJoin() {
  const { roomId, joinRoom, createRoom, user } = usePartyKit();
  const [inputRoomId, setInputRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setIsConnecting(false);
    }
  }, [user]);

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      setIsConnecting(true);
      joinRoom(inputRoomId.trim());
    }
  };

  const handleCreateRoom = () => {
    createRoom();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-6xl font-bold text-primary mb-4">Partytime</div>
          <p className="text-xl text-textSecondary">Quiz Game</p>
        </motion.div>

        {/* Room Actions */}
        <div className="space-y-4">
          {/* Join Room */}
          <motion.div
            className="bg-surface p-6 rounded-lg border border-primary/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-text mb-4">Join a Room</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-3 py-2 border border-primary/20 rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <motion.button
                onClick={handleJoinRoom}
                disabled={!inputRoomId.trim()}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn size={20} />
                <span>Join Room</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Create Room */}
          <motion.div
            className="bg-surface p-6 rounded-lg border border-primary/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-text mb-4">Create a New Room</h3>
            <motion.button
              onClick={handleCreateRoom}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              <span>Create Room</span>
            </motion.button>
          </motion.div>

          {/* Current Room Info */}
          {roomId && (
            <motion.div
              className="bg-surface p-6 rounded-lg border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-text mb-4">Current Room</h3>
              <div className="flex items-center space-x-2 p-3 bg-background rounded border border-primary/10">
                <span className="text-sm text-textSecondary">Room ID:</span>
                <span className="text-sm font-mono text-primary">{roomId}</span>
                <motion.button
                  onClick={copyRoomId}
                  className="ml-auto p-1 hover:bg-primary/10 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </motion.button>
              </div>
              <p className="text-sm text-textSecondary mt-2">
                Share this room ID with friends to invite them!
              </p>
            </motion.div>
          )}
        </div>

        {/* Instructions */}
        <motion.div
          className="text-center text-sm text-textSecondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Join an existing room or create a new one to start playing!</p>
        </motion.div>

        {/* Connecting State */}
        {isConnecting && (
          <motion.div
            className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <LoadingSpinner size="md" text="Connecting to room..." />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
