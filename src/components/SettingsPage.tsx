import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const SettingsPage: React.FC = () => {
  const { 
    users,
    currentUserId,
    isPlayer, 
    isNarrator, 
    isAdmin, 
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle 
  } = useApp();
  
  // Get current user's name from users array
  const currentUser = users.find(user => user.id === currentUserId) || users[0];
  const userName = currentUser?.name || '';
  const [editingName, setEditingName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSave = () => {
    if (editingName.trim() && editingName !== userName) {
      handleNameChange(editingName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditingName(userName);
    setIsEditingName(false);
  };

  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="max-w-lg mx-auto"
    >
      <h2 className="mb-8 text-gray-600 text-3xl text-center">Settings</h2>
        
        {/* Name Setting */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-600 mb-2">Your Name:</span>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  id="userName"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
                <button 
                  onClick={handleNameSave} 
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  <Save size={16} />
                  Save
                </button>
                <button 
                  onClick={handleNameCancel} 
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="flex-1 text-gray-700">{userName}</span>
                <button 
                  onClick={() => {
                    setIsEditingName(true);
                    // Auto-focus and select all text after state update
                    setTimeout(() => {
                      const nameInput = document.getElementById('userName') as HTMLInputElement;
                      if (nameInput) {
                        nameInput.focus();
                        nameInput.select();
                      }
                    }, 0);
                  }} 
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Player Toggle */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-600 mb-2">Participate in Game:</span>
          <div className="flex items-center gap-3">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isPlayer"
                checked={isPlayer}
                onChange={(e) => handlePlayerToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="text-gray-700">
              {isPlayer ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Narrator Toggle */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-600 mb-2">Read Questions Aloud:</span>
          <div className="flex items-center gap-3">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isNarrator"
                checked={isNarrator}
                onChange={(e) => handleNarratorToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="text-gray-700">
              {isNarrator ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Admin Toggle */}
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-600 mb-2">Admin Access:</span>
          <div className="flex items-center gap-3">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => handleAdminToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="text-gray-700">
              {isAdmin ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
    </motion.div>
  );
};
