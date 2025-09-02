import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mic, Gamepad, Crown } from 'lucide-react';
import { useRoomContext } from '../contexts/RoomContext';

interface MembersPanelProps {
  showMembersPanel: boolean;
  onRef: (ref: HTMLDivElement | null) => void;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({
  showMembersPanel,
  onRef
}) => {
  const { gameState } = useRoomContext();
  return (
    <motion.div 
      ref={onRef}
      className={`members-panel ${showMembersPanel ? 'show' : 'hide'}`}
      initial={false}
      animate={{
        width: showMembersPanel ? 300 : 0,
        opacity: showMembersPanel ? 1 : 0,
        x: showMembersPanel ? 0 : -100
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="members-content">
        <h3>Members ({gameState.users.length})</h3>
        {gameState.users.length === 0 ? (
          <p className="no-users">No users in room yet...</p>
        ) : (
          <ul className="users-list">
            <AnimatePresence>
              {gameState.users.map((user, index) => (
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
    </motion.div>
  );
};
