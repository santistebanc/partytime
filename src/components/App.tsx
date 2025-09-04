import React from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "../contexts/AppContext";
import { Lobby } from "./Lobby";
import { Room } from "./Room";
import { AppLayout, PageTransition } from "./layout";

const AppContent: React.FC = () => {
  const { roomId, userName } = useApp();

  return (
    <AppLayout background="white" minHeight="screen">
      <AnimatePresence mode="wait">
        {roomId && userName ? (
          <PageTransition currentPage="room">
            <Room />
          </PageTransition>
        ) : (
          <PageTransition currentPage="lobby">
            <Lobby />
          </PageTransition>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
