import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "../contexts/AppContext";
import { Lobby } from "./Lobby";
import { Room } from "./Room";

const AppContent: React.FC = () => {
  const { roomId, userName } = useApp();

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {roomId && userName ? (
          <motion.div
            key="room"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Room />
          </motion.div>
        ) : (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Lobby />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
