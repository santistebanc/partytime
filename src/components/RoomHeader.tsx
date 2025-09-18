import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Users
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface RoomHeaderProps {
  onMenuPanelToggle: (show: boolean) => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  onMenuPanelToggle
}) => {
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const { roomId, users } = useApp();
  
  const toggleMenuPanel = () => {
    const newShowState = !showMenuPanel;
    setShowMenuPanel(newShowState);
    onMenuPanelToggle(newShowState);
  };
  
  const usersCount = users.length;
  return (
    <motion.header className="room-header">
      <div className="header-content">
        {/* Menu Toggle Button - Left Side */}
        <motion.button 
          onClick={toggleMenuPanel} 
          className={`menu-toggle-btn ${showMenuPanel ? 'active' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showMenuPanel ? 'Hide Menu' : 'Show Menu'}
        >
          <Menu size={20} />
          {usersCount > 0 && (
            <motion.span 
              key={usersCount}
              className="menu-count-badge"
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

        {/* Room Title */}
        <div className="room-title">
          <h1>{roomId?.toUpperCase()}</h1>
        </div>
      </div>
    </motion.header>
  );
};
