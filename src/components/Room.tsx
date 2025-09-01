import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Settings, 
  Crown, 
  Users, 
  UserMinus, 
  LogOut,
  QrCode,
  Edit3,
  Save,
  X,
  User as UserIcon,
  Mic,
  Gamepad
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import QRCode from 'qrcode';
import { PartytimeLogo } from './PartytimeLogo';
import { getStoredUserId, setStoredUserId } from '../contexts/NavigationContext';
import { QuizAdminPage } from './QuizAdminPage';
import type { QuizQuestion, User } from '../types/quiz';

interface RoomProps {
  roomId: string;
  userName: string;
  onNavigateToLobby: () => void;
  onNameChange?: (newName: string) => void;
}

type ContentPage = 'game' | 'settings' | 'admin';

export const Room: React.FC<RoomProps> = ({ roomId, userName, onNavigateToLobby, onNameChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<ContentPage>('game');
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [editingName, setEditingName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [initialQuestions, setInitialQuestions] = useState<QuizQuestion[]>([]);
  const [initialTopics, setInitialTopics] = useState<string[]>([]);
  const [isPlayer, setIsPlayer] = useState(true);
  const [isNarrator, setIsNarrator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const { socket, isConnected, sendMessage } = useSocket();
  const membersPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Send join message when socket connects
    if (isConnected && socket) {
      // Try to use stored user ID first, fallback to generating new one
      let userId = getStoredUserId();
      if (!userId) {
        userId = crypto.randomUUID();
        setStoredUserId(userId);
      }
      
      console.log('Sending join message:', { name: userName, userId, roomId });
      
      sendMessage({
        type: 'join',
        name: userName,
        userId
      });
    }
  }, [isConnected, socket, roomId, userName, sendMessage]);

  // Generate QR code for the room
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const roomUrl = `${window.location.origin}?roomId=${roomId}`;
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#667eea',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (roomId && userName) {
      generateQRCode();
    }
  }, [roomId, userName]);

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

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'joined') {
          console.log('Joined room confirmation:', data);
          setCurrentUserId(data.userId);
          
          // Set user toggle states from server
          if (data.userToggles) {
            setIsPlayer(data.userToggles.isPlayer);
            setIsNarrator(data.userToggles.isNarrator);
            setIsAdmin(data.userToggles.isAdmin);
          }
        } else if (data.type === 'nameChanged') {
          console.log('Name changed:', data);
          // Update the user's name in the local state
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === data.userId 
                ? { ...user, name: data.newName }
                : user
            )
          );
          
          // If this is the current user's name change, update local state and URL
          if (data.oldName === userName) {
            console.log('Your name has been changed to:', data.newName);
            // Call the callback to update the parent component and URL
            if (onNameChange) {
              onNameChange(data.newName);
            }
            // Update the stored user ID to maintain continuity
            if (currentUserId) {
              setStoredUserId(currentUserId);
            }
          }
        } else if (data.type === 'questions') {
          console.log('Received questions from server:', data.questions);
          console.log('Setting initialQuestions state with', data.questions.length, 'questions');
          setInitialQuestions(data.questions);
        } else if (data.type === 'topics') {
          console.log('Received topics from server:', data.topics);
          setInitialTopics(data.topics);
        } else if (data.type === 'users') {
          console.log('Setting users:', data.users);
          setUsers(data.users);
          
          // Update current user's toggle states if available
          if (currentUserId) {
            const currentUser = data.users.find((user: User) => user.id === currentUserId);
            if (currentUser) {
              setIsPlayer(currentUser.isPlayer);
              setIsNarrator(currentUser.isNarrator);
              setIsAdmin(currentUser.isAdmin);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, userName]);

  const handleLeaveRoom = () => {
    onNavigateToLobby();
  };

  const handleNameSave = () => {
    if (editingName.trim() && editingName !== userName && currentUserId) {
      // Send name update to server
      sendMessage({
        type: 'changeName',
        oldName: userName,
        newName: editingName.trim(),
        userId: currentUserId
      });
      
      // Update local state
      setIsEditingName(false);
    } else {
      // No change, empty name, or no user ID, just close edit mode
      setIsEditingName(false);
      setEditingName(userName); // Reset to original name
    }
  };

  const handlePlayerToggle = (newValue: boolean) => {
    setIsPlayer(newValue);
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isPlayer: newValue
      });
    }
  };

  const handleNarratorToggle = (newValue: boolean) => {
    setIsNarrator(newValue);
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isNarrator: newValue
      });
    }
  };

  const handleAdminToggle = (newValue: boolean) => {
    setIsAdmin(newValue);
    
    if (currentUserId) {
      sendMessage({
        type: 'updateUserToggles',
        userId: currentUserId,
        isAdmin: newValue
      });
    }
  };

  const toggleMembersPanel = () => {
    setShowMembersPanel(!showMembersPanel);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'game':
        return (
          <motion.div 
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="content-page game-page"
          >
            <div className="game-content">
              <motion.div 
                className="partytime-logo"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="logo-container"
                >
                  <PartytimeLogo size={180} />
                </motion.div>

              </motion.div>
              <motion.div 
                className="qr-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <h3>Join this room on mobile:</h3>
                <div className="qr-code">
                  {qrCodeDataUrl ? (
                    <motion.div 
                      className="qr-code-container clickable"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const roomUrl = `${window.location.origin}?roomId=${roomId}`;
                        navigator.clipboard.writeText(roomUrl).then(() => {
                          setShowCopiedMessage(true);
                          setTimeout(() => setShowCopiedMessage(false), 2000);
                        }).catch(err => {
                          console.error('Failed to copy URL:', err);
                        });
                      }}
                      title="Click to copy room URL"
                    >
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code to join this room (click to copy URL)"
                        className="qr-code-image"
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="qr-loading"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <QrCode size={80} color="#667eea" />
                      <span>Generating QR Code...</span>
                    </motion.div>
                  )}
                  {showCopiedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="copied-message"
                    >
                      ✓ Room URL copied to clipboard!
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      
      case 'settings':
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
                        onClick={() => setIsEditingName(false)} 
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
                      onChange={(e) => handlePlayerToggle(e.target.checked)}
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
                      onChange={(e) => handleNarratorToggle(e.target.checked)}
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
                      onChange={(e) => handleAdminToggle(e.target.checked)}
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
      
      case 'admin':
        if (!isAdmin) {
          // Redirect to game page if user doesn't have admin access
          setCurrentPage('game');
          return null;
        }
        return (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="content-page admin-page"
          >
            <QuizAdminPage initialQuestions={initialQuestions} initialTopics={initialTopics} socket={socket} />
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="room">
      {/* Sticky Header */}
      <motion.header 
        className="room-header"
      >
        <div className="header-content">
          {/* Members Toggle Button - Left Side */}
          <motion.button 
            ref={toggleButtonRef}
            onClick={toggleMembersPanel} 
            className={`members-toggle-btn ${showMembersPanel ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={showMembersPanel ? 'Hide Members' : 'Show Members'}
          >
            <Users size={20} />
            {users.length > 0 && (
              <motion.span 
                key={users.length}
                className="members-count-badge"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 25,
                  duration: 0.3 
                }}
              >
                {users.length}
              </motion.span>
            )}
          </motion.button>

          {/* Room Title - Right of Members Button */}
          <div className="room-title">
            <h1>{roomId}</h1>
          </div>

          {/* Right Side: Navigation Buttons */}
          <div className="header-buttons">
            <motion.button 
              onClick={() => setCurrentPage('game')} 
              className={`header-btn ${currentPage === 'game' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Game"
            >
              <Gamepad2 size={18} />
            </motion.button>
            <motion.button 
              onClick={() => setCurrentPage('settings')} 
              className={`header-btn ${currentPage === 'settings' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <Settings size={18} />
            </motion.button>
            {isAdmin && (
              <motion.button 
                onClick={() => setCurrentPage('admin')} 
                className={`header-btn ${currentPage === 'admin' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Admin"
              >
                <Crown size={18} />
              </motion.button>
            )}
 
            <motion.button 
              onClick={handleLeaveRoom} 
              className="header-btn btn-leave"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Leave Room"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="room-main">
        {/* Members Panel */}
        <motion.div 
          ref={membersPanelRef}
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
            <h3>Members</h3>
            {users.length === 0 ? (
              <p className="no-users">No users in room yet...</p>
            ) : (
              <ul className="users-list">
                <AnimatePresence>
                  {users.map((user, index) => (
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

        {/* Content Panel */}
        <div className="content-panel">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
