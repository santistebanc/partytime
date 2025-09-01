import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X } from 'lucide-react';

interface SettingsPageProps {
  userName: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  onNameChange: (newName: string) => void;
  onPlayerToggle: (value: boolean) => void;
  onNarratorToggle: (value: boolean) => void;
  onAdminToggle: (value: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userName,
  isPlayer,
  isNarrator,
  isAdmin,
  onNameChange,
  onPlayerToggle,
  onNarratorToggle,
  onAdminToggle
}) => {
  const [editingName, setEditingName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSave = () => {
    if (editingName.trim() && editingName !== userName) {
      onNameChange(editingName.trim());
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
      <div className="settings-content">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.15 }}
        >
          Settings
        </motion.h2>
        
        {/* Name Setting */}
        <motion.div 
          className="setting-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.15 }}
        >
          <span className="setting-label">Your Name:</span>
          <div className="name-edit">
            {isEditingName ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="edit-controls"
              >
                <input
                  type="text"
                  id="userName"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="name-input"
                  maxLength={20}
                />
                <motion.button 
                  onClick={handleNameSave} 
                  className="btn btn-save"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={16} />
                  Save
                </motion.button>
                <motion.button 
                  onClick={handleNameCancel} 
                  className="btn btn-cancel"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={16} />
                  Cancel
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="display-controls"
              >
                <span className="current-name">{userName}</span>
                <motion.button 
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 size={16} />
                  Edit
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Player Toggle */}
        <motion.div 
          className="setting-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.15 }}
        >
          <span className="setting-label">Participate in Game:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isPlayer"
                checked={isPlayer}
                onChange={(e) => onPlayerToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isPlayer ? 'Yes' : 'No'}
            </span>
          </div>
        </motion.div>

        {/* Narrator Toggle */}
        <motion.div 
          className="setting-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.15 }}
        >
          <span className="setting-label">Read Questions Aloud:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isNarrator"
                checked={isNarrator}
                onChange={(e) => onNarratorToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isNarrator ? 'Yes' : 'No'}
            </span>
          </div>
        </motion.div>

        {/* Admin Toggle */}
        <motion.div 
          className="setting-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.15 }}
        >
          <span className="setting-label">Admin Access:</span>
          <div className="toggle-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => onAdminToggle(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {isAdmin ? 'Yes' : 'No'}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
