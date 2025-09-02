import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Settings, 
  Crown, 
  Users, 
  LogOut
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface RoomHeaderProps {
  currentPage: 'game' | 'settings' | 'admin';
  onPageChange: (page: 'game' | 'settings' | 'admin') => void;
  onMembersPanelToggle: (show: boolean) => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  currentPage,
  onPageChange,
  onMembersPanelToggle
}) => {
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const { roomId, userName, navigateToLobby, users, isAdmin } = useApp();
  
  const handleLeaveRoom = () => {
    navigateToLobby();
  };
  
  const toggleMembersPanel = () => {
    const newShowState = !showMembersPanel;
    setShowMembersPanel(newShowState);
    onMembersPanelToggle(newShowState);
  };
  
  const usersCount = users.length;
  return (
    <motion.header className="room-header">
      <div className="header-content">
        {/* Members Toggle Button - Left Side */}
        <motion.button 
          onClick={toggleMembersPanel} 
          className={`members-toggle-btn ${showMembersPanel ? 'active' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showMembersPanel ? 'Hide Members' : 'Show Members'}
        >
          <Users size={20} />
          {usersCount > 0 && (
            <motion.span 
              key={usersCount}
              className="members-count-badge"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 25,
                duration: 0.3 
              }}
            >
              {usersCount}
            </motion.span>
          )}
        </motion.button>

        {/* Room Title - Right of Members Button */}
        <div className="room-title">
          <h1>{roomId}</h1>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="header-buttons">
          <motion.button 
            onClick={() => onPageChange('game')} 
            className={`header-btn ${currentPage === 'game' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Game"
          >
            <Gamepad2 size={18} />
          </motion.button>
          <motion.button 
            onClick={() => onPageChange('settings')} 
            className={`header-btn ${currentPage === 'settings' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <Settings size={18} />
          </motion.button>
          {isAdmin && (
            <motion.button 
              onClick={() => onPageChange('admin')} 
              className={`header-btn ${currentPage === 'admin' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Admin"
            >
              <Crown size={18} />
            </motion.button>
          )}
          <motion.button 
            onClick={handleLeaveRoom} 
            className="header-btn btn-leave"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Leave Room"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
