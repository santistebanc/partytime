import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Settings, 
  Crown, 
  Users, 
  LogOut
} from 'lucide-react';

interface RoomHeaderProps {
  roomId: string;
  currentPage: 'game' | 'settings' | 'admin';
  usersCount: number;
  isAdmin: boolean;
  showMembersPanel: boolean;
  onPageChange: (page: 'game' | 'settings' | 'admin') => void;
  onToggleMembersPanel: () => void;
  onLeaveRoom: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  currentPage,
  usersCount,
  isAdmin,
  showMembersPanel,
  onPageChange,
  onToggleMembersPanel,
  onLeaveRoom
}) => {
  return (
    <motion.header className="room-header">
      <div className="header-content">
        {/* Members Toggle Button - Left Side */}
        <motion.button 
          onClick={onToggleMembersPanel} 
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
            onClick={onLeaveRoom} 
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
