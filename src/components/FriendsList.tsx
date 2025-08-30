import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Gamepad2, 
  Volume2, 
  Shield, 
  Crown,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { usePartyKit } from '../hooks/usePartyKit';
import type { User } from '../../party/server';

interface FriendsListProps {
  isVisible: boolean;
}

export function FriendsList({ isVisible }: FriendsListProps) {
  const { user, roomState, toggleRole } = usePartyKit();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const players = roomState.users.filter(u => u.isPlayer);
  const spectators = roomState.users.filter(u => !u.isPlayer);

  const handleUserClick = (clickedUser: User) => {
    if (user?.isAdmin && clickedUser.id !== user.id) {
      setSelectedUser(clickedUser);
    }
  };

  const toggleUserProperty = (userId: string, property: 'isPlayer' | 'isNarrator' | 'isAdmin') => {
    toggleRole(property, userId);
    setSelectedUser(null);
  };

  const UserItem = ({ user: userItem, isPlayer }: { user: User; isPlayer: boolean }) => (
    <motion.div
      key={userItem.id}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isPlayer 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-surface border-primary/20'
      } ${userItem.isHost ? 'ring-2 ring-accent' : ''}`}
      onClick={() => handleUserClick(userItem)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {userItem.isHost && (
            <Crown className="text-accent" size={16} />
          )}
          <span className={`font-medium ${isPlayer ? 'text-primary' : 'text-textSecondary'}`}>
            {userItem.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${userItem.isPlayer ? 'bg-success/20 text-success' : 'bg-surface'}`}>
            <Gamepad2 size={14} />
          </div>
          <div className={`p-1 rounded ${userItem.isNarrator ? 'bg-info/20 text-info' : 'bg-surface'}`}>
            <Volume2 size={14} />
          </div>
          <div className={`p-1 rounded ${userItem.isAdmin ? 'bg-warning/20 text-warning' : 'bg-surface'}`}>
            <Shield size={14} />
          </div>
          {user?.isAdmin && userItem.id !== user.id && (
            <MoreVertical size={16} className="text-textSecondary" />
          )}
        </div>
      </div>
      
      <div className="mt-2 text-sm text-textSecondary">
        Points: {userItem.points}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          className="fixed left-0 top-16 h-full w-80 bg-surface border-r border-primary/20 shadow-lg z-40 overflow-y-auto"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-primary" size={20} />
              <h2 className="text-lg font-semibold text-text">Friends</h2>
              <span className="ml-auto text-sm text-textSecondary">
                {roomState.users.length}
              </span>
            </div>

            {players.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-primary mb-2">Players</h3>
                <div className="space-y-2">
                  {players.map(userItem => (
                    <UserItem key={userItem.id} user={userItem} isPlayer={true} />
                  ))}
                </div>
              </div>
            )}

            {spectators.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-textSecondary mb-2">Spectators</h3>
                <div className="space-y-2">
                  {spectators.map(userItem => (
                    <UserItem key={userItem.id} user={userItem} isPlayer={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Options Modal */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
              >
                <motion.div
                  className="bg-surface p-6 rounded-lg shadow-xl border border-primary/20"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-text mb-4">
                    Manage {selectedUser.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => toggleUserProperty(selectedUser.id, 'isPlayer')}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        selectedUser.isPlayer 
                          ? 'bg-success/20 border-success/30 text-success' 
                          : 'bg-surface border-primary/20 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Player</span>
                        {selectedUser.isPlayer ? <Check size={16} /> : <X size={16} />}
                      </div>
                    </button>

                    <button
                      onClick={() => toggleUserProperty(selectedUser.id, 'isNarrator')}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        selectedUser.isNarrator 
                          ? 'bg-info/20 border-info/30 text-info' 
                          : 'bg-surface border-primary/20 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Narrator</span>
                        {selectedUser.isNarrator ? <Check size={16} /> : <X size={16} />}
                      </div>
                    </button>

                    <button
                      onClick={() => toggleUserProperty(selectedUser.id, 'isAdmin')}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        selectedUser.isAdmin 
                          ? 'bg-warning/20 border-warning/30 text-warning' 
                          : 'bg-surface border-primary/20 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Admin</span>
                        {selectedUser.isAdmin ? <Check size={16} /> : <X size={16} />}
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-full mt-4 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
