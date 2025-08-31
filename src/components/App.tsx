import React from 'react';
import { NavigationProvider, useNavigation } from '../contexts/NavigationContext';
import { SocketProvider } from '../contexts/SocketContext';
import { Lobby } from './Lobby';
import { Room } from './Room';

const AppContent: React.FC = () => {
  const { roomId, userName, navigateToRoom, navigateToLobby } = useNavigation();

  return (
    <div className="app">
      {roomId && userName ? (
        <SocketProvider roomId={roomId}>
          <Room 
            roomId={roomId} 
            userName={userName} 
            onNavigateToLobby={navigateToLobby} 
          />
        </SocketProvider>
      ) : (
        <Lobby onNavigateToRoom={navigateToRoom} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
};

export default App;
