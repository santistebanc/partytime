import React, { useEffect } from 'react';
import { usePartyKit } from '../hooks/usePartyKit';

interface KeyboardShortcutsProps {
  onNavigate: (page: string) => void;
  onToggleFriends: () => void;
}

export function KeyboardShortcuts({ onNavigate, onToggleFriends }: KeyboardShortcutsProps) {
  const { buzzIn, user, roomState } = usePartyKit();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case '1':
        case 'g':
          onNavigate('game');
          break;
        case '2':
        case 'c':
          onNavigate('chat');
          break;
        case '3':
        case 's':
          onNavigate('settings');
          break;
        case 'f':
          onToggleFriends();
          break;
        case ' ':
          // Spacebar to buzz in (only if player and can buzz)
          if (user?.isPlayer && !roomState.gameState.currentBuzzer && roomState.gameState.isActive) {
            event.preventDefault();
            buzzIn();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNavigate, onToggleFriends, buzzIn, user, roomState.gameState]);

  return null; // This component doesn't render anything
}
