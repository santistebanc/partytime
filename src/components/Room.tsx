import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface User {
  id: string;
  name: string;
}

interface RoomProps {
  roomId: string;
  userName: string;
  onNavigateToLobby: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomId, userName, onNavigateToLobby }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { socket, isConnected, sendMessage } = useSocket();

  useEffect(() => {
    // Send join message when socket connects
    if (isConnected && socket) {
      const userId = crypto.randomUUID();
      console.log('Sending join message:', { name: userName, userId, roomId });
      
      sendMessage({
        type: 'join',
        name: userName,
        userId
      });
    }
  }, [isConnected, socket, roomId, userName, sendMessage]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'users') {
          console.log('Setting users:', data.users);
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  const handleLeaveRoom = () => {
    onNavigateToLobby();
  };

  return (
    <div className="room">
      <div className="room-container">
        <div className="room-header">
          <h1 className="room-title">Room: {roomId}</h1>
          <button onClick={handleLeaveRoom} className="btn btn-leave">
            Leave Room
          </button>
        </div>

        <div className="room-info">
          <p className="room-name">Room Name: <span className="highlight">{roomId}</span></p>
          <p className="your-name">Your name: <span className="highlight">{userName}</span></p>
        </div>

        <div className="users-section">
          <h2 className="users-title">Users in Room ({users.length})</h2>
          {users.length === 0 ? (
            <p className="no-users">No users in room yet...</p>
          ) : (
            <ul className="users-list">
              {users.map((user) => (
                <li key={user.id} className="user-item">
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
