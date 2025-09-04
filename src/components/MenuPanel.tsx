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
      className={`sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden pt-16 px-4 pb-5 ${
        showMenuPanel ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 w-0'
      }`}
      initial={false}
      animate={{
        width: showMenuPanel ? 256 : 0,
        opacity: showMenuPanel ? 1 : 0,
        x: showMenuPanel ? 0 : -100
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Room Name */}
      <h2 className="text-2xl font-semibold text-gray-600 mb-5 text-center">{roomId}</h2>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 mb-6 pb-5">
          <motion.button 
            onClick={() => onPageChange('game')} 
            className={`flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:translate-x-1 ${
              currentPage === 'game' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Game"
          >
            <Gamepad size={18} className={currentPage === 'game' ? 'text-white' : 'text-gray-700'} />
            <span className={currentPage === 'game' ? 'text-white' : 'text-gray-700'}>Game</span>
          </motion.button>
          <motion.button 
            onClick={() => onPageChange('settings')} 
            className={`flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:translate-x-1 ${
              currentPage === 'settings' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <Settings size={18} className={currentPage === 'settings' ? 'text-white' : 'text-gray-700'} />
            <span className={currentPage === 'settings' ? 'text-white' : 'text-gray-700'}>Settings</span>
          </motion.button>
          {isAdmin && (
            <motion.button 
              onClick={() => onPageChange('admin')} 
              className={`flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:translate-x-1 ${
                currentPage === 'admin' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Admin"
            >
              <Crown size={18} className={currentPage === 'admin' ? 'text-white' : 'text-gray-700'} />
              <span className={currentPage === 'admin' ? 'text-white' : 'text-gray-700'}>Admin</span>
            </motion.button>
          )}
          <motion.button 
            onClick={handleLeaveRoom} 
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-red-500 text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-red-50 hover:translate-x-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Leave Room"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="text-red-500">Leave</span>
          </motion.button>
        </div>

        {/* Members Section */}
        <div className="mt-5">
          <h3 className="text-xl font-medium text-gray-600 mb-5 pb-2">Room</h3>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 italic py-5">No users in room yet...</p>
        ) : (
          <ul className="list-none p-0">
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.li 
                  key={user.id} 
                  className="flex items-center gap-3 px-4 py-3 mb-2 bg-white border-none rounded-lg transition-all duration-300 relative hover:bg-blue-50 hover:border-blue-500 hover:border-2 hover:translate-x-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.15 }}
                >
                  <UserIcon size={16} className="text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-gray-600 flex-1">{user.name}</span>
                  <div className="flex gap-1">
                    {user.isPlayer && (
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center" title="Player">
                        <Gamepad size={14} className="text-white" />
                      </div>
                    )}
                    {user.isNarrator && (
                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center" title="Narrator">
                        <Mic size={14} className="text-white" />
                      </div>
                    )}
                    {user.isAdmin && (
                      <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center" title="Admin">
                        <Crown size={14} className="text-white" />
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
