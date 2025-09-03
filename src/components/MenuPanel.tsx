import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mic, Gamepad, Crown, Settings, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface MenuPanelProps {
  showMenuPanel: boolean;
  onRef: (ref: HTMLDivElement | null) => void;
  currentPage: 'game' | 'settings' | 'admin';
  onPageChange: (page: 'game' | 'settings' | 'admin') => void;
  onMenuToggle: (show: boolean) => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const MenuPanel: React.FC<MenuPanelProps> = ({
  showMenuPanel,
  onRef,
  currentPage,
  onPageChange,
  onMenuToggle,
  toggleButtonRef
}) => {
  const { users, isAdmin, navigateToLobby, roomId } = useApp();
  
  const handleLeaveRoom = () => {
    navigateToLobby();
  };
  return (
    <motion.div 
      ref={onRef}
      className={`menu-panel ${showMenuPanel ? 'show' : 'hide'}`}
      initial={false}
      animate={{
        width: showMenuPanel ? 300 : 0,
        opacity: showMenuPanel ? 1 : 0,
        x: showMenuPanel ? 0 : -100
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="menu-content">
        {/* Room Name */}
        <div className="room-name-section">
          <h2 className="room-name">{roomId}</h2>
        </div>

        {/* Navigation Buttons */}
        <div className="menu-navigation">
          <motion.button 
            onClick={() => onPageChange('game')} 
            className={`menu-nav-btn ${currentPage === 'game' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Game"
          >
            <Gamepad size={18} />
            <span>Game</span>
          </motion.button>
          <motion.button 
            onClick={() => onPageChange('settings')} 
            className={`menu-nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </motion.button>
          {isAdmin && (
            <motion.button 
              onClick={() => onPageChange('admin')} 
              className={`menu-nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Admin"
            >
              <Crown size={18} />
              <span>Admin</span>
            </motion.button>
          )}
          <motion.button 
            onClick={handleLeaveRoom} 
            className="menu-nav-btn btn-leave"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Leave Room"
          >
            <LogOut size={18} />
            <span>Leave</span>
          </motion.button>
        </div>

        {/* Members Section */}
        <div className="menu-section">
          <h3>Room ({users.length})</h3>
        {users.length === 0 ? (
          <p className="no-users">No users in room yet...</p>
        ) : (
          <ul className="users-list">
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.li 
                  key={user.id} 
                  className="user-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.15 }}
                >
                  <UserIcon size={16} className="user-avatar" />
                  <span className="user-name">{user.name}</span>
                  <div className="user-toggles">
                    {user.isPlayer && (
                      <div className="toggle-icon player-icon" title="Player">
                        <Gamepad size={14} />
                      </div>
                    )}
                    {user.isNarrator && (
                      <div className="toggle-icon narrator-icon" title="Narrator">
                        <Mic size={14} />
                      </div>
                    )}
                    {user.isAdmin && (
                      <div className="toggle-icon admin-icon" title="Admin">
                        <Crown size={14} />
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        </div>
      </div>
    </motion.div>
  );
};
