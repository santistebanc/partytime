import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RoomHeader } from './RoomHeader';
import { MembersPanel } from './MembersPanel';
import { ContentRouter } from './ContentRouter';
import { useRoom } from '../hooks/useRoom';
import { useNavigation } from '../hooks/useNavigation';

interface RoomProps {
  roomId: string;
  userName: string;
}

export const Room: React.FC<RoomProps> = ({ roomId, userName }) => {
  const [currentPage, setCurrentPage] = useState<'game' | 'settings' | 'admin'>('game');
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  const {
    users,
    currentUserId,
    initialQuestions,
    initialTopics,
    revealState,
    isPlayer,
    isNarrator,
    isAdmin,
    socket,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle
  } = useRoom(roomId, userName);

  const { navigateToLobby } = useNavigation();
  
  const membersPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside members panel on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't hide if clicking on the toggle button
      const target = event.target as Node;
      if (toggleButtonRef.current && toggleButtonRef.current.contains(target)) {
        return;
      }
      
      if (membersPanelRef.current && !membersPanelRef.current.contains(target)) {
        // Only hide on mobile (when screen width is small)
        if (window.innerWidth <= 768) {
          setShowMembersPanel(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLeaveRoom = () => {
    navigateToLobby();
  };

  const toggleMembersPanel = () => {
    setShowMembersPanel(!showMembersPanel);
  };

  const handleCopyMessage = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };



  return (
    <div className="room">
      <RoomHeader
        roomId={roomId}
        currentPage={currentPage}
        usersCount={users.length}
        isAdmin={isAdmin}
        showMembersPanel={showMembersPanel}
        onPageChange={setCurrentPage}
        onToggleMembersPanel={toggleMembersPanel}
        onLeaveRoom={handleLeaveRoom}
      />

      <div className="room-main">
        <MembersPanel
          users={users}
          showMembersPanel={showMembersPanel}
          onRef={(ref) => {
            membersPanelRef.current = ref;
          }}
        />

        <ContentRouter
          currentPage={currentPage}
          roomId={roomId}
          userName={userName}
          isPlayer={isPlayer}
          isNarrator={isNarrator}
          isAdmin={isAdmin}
          showCopiedMessage={showCopiedMessage}
          initialQuestions={initialQuestions}
          initialTopics={initialTopics}
          revealState={revealState}
          socket={socket}
          onNameChange={handleNameChange}
          onPlayerToggle={handlePlayerToggle}
          onNarratorToggle={handleNarratorToggle}
          onAdminToggle={handleAdminToggle}
          onCopyMessage={handleCopyMessage}
        />
      </div>
    </div>
  );
};
