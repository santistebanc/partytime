import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button, Input, Toggle, Card } from './ui';
import { PageLayout, StaggeredList } from './layout';

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
    <PageLayout maxWidth="lg" center>
      <Card 
        padding="lg"
        shadow="md"
        animate
      >
        <h2 className="mb-8 text-gray-600 text-3xl text-center">Settings</h2>
        
        <StaggeredList className="space-y-6" staggerDelay={0.1}>
          {/* Name Setting */}
          <div>
          <span className="block text-sm font-medium text-gray-600 mb-2">Your Name:</span>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  id="userName"
                  value={editingName}
                  onChange={setEditingName}
                  className="flex-1"
                  maxLength={20}
                />
                <Button 
                  onClick={handleNameSave} 
                  variant="success"
                  size="sm"
                  icon={<Save size={16} />}
                >
                  Save
                </Button>
                <Button 
                  onClick={handleNameCancel} 
                  variant="secondary"
                  size="sm"
                  icon={<X size={16} />}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="flex-1 text-gray-700">{userName}</span>
                <Button 
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
                  variant="primary"
                  size="sm"
                  icon={<Edit3 size={16} />}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
          </div>
          
          {/* Player Toggle */}
          <div>
          <Toggle
            id="isPlayer"
            checked={isPlayer}
            onChange={handlePlayerToggle}
            label="Participate in Game:"
          />
          <span className="text-gray-700 ml-3">
            {isPlayer ? 'Yes' : 'No'}
          </span>
          </div>

          {/* Narrator Toggle */}
          <div>
          <Toggle
            id="isNarrator"
            checked={isNarrator}
            onChange={handleNarratorToggle}
            label="Read Questions Aloud:"
          />
          <span className="text-gray-700 ml-3">
            {isNarrator ? 'Yes' : 'No'}
          </span>
          </div>

          {/* Admin Toggle */}
          <div>
          <Toggle
            id="isAdmin"
            checked={isAdmin}
            onChange={handleAdminToggle}
            label="Admin Access:"
          />
          <span className="text-gray-700 ml-3">
            {isAdmin ? 'Yes' : 'No'}
          </span>
          </div>
        </StaggeredList>
      </Card>
    </PageLayout>
  );
};
