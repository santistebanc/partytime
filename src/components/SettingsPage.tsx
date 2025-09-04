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
      className="content-page settings-page"
    >
      <h2>Settings</h2>
        
        {/* Name Setting */}
        <div className="setting-item">
          <span className="setting-label">Your Name:</span>
          <div className="name-edit">
            {isEditingName ? (
              <div className="edit-controls">
                <input
                  type="text"
                  id="userName"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="name-input"
                  maxLength={20}
                />
                <button 
                  onClick={handleNameSave} 
                  className="btn btn-save"
                >
                  <Save size={16} />
                  Save
                </button>
                <button 
                  onClick={handleNameCancel} 
                  className="btn btn-cancel"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="display-controls">
                <span className="current-name">{userName}</span>
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
                  className="btn btn-edit"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Player Toggle */}
        <div className="setting-item">
          <span className="setting-label">Participate in Game:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isPlayer"
                checked={isPlayer}
                onChange={(e) => handlePlayerToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isPlayer ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Narrator Toggle */}
        <div className="setting-item">
          <span className="setting-label">Read Questions Aloud:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isNarrator"
                checked={isNarrator}
                onChange={(e) => handleNarratorToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isNarrator ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Admin Toggle */}
        <div className="setting-item">
          <span className="setting-label">Admin Access:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => handleAdminToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isAdmin ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
    </motion.div>
  );
};
