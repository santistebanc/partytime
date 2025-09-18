import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mic,
  Gamepad,
  Crown,
  Settings,
  LogOut,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { Button, Badge } from "./ui";

interface MenuPanelProps {
  showMenuPanel: boolean;
  onRef: (ref: HTMLDivElement | null) => void;
  currentPage: "game" | "settings" | "admin";
  onPageChange: (page: "game" | "settings" | "admin") => void;
  onMenuToggle: (show: boolean) => void;
}

export const MenuPanel: React.FC<MenuPanelProps> = ({
  showMenuPanel,
  onRef,
  currentPage,
  onPageChange,
  onMenuToggle,
}) => {
  const { users, isAdmin, navigateToLobby, roomId } = useApp();

  const handleLeaveRoom = () => {
    navigateToLobby();
  };
  return (
    <>
      {/* Mobile Overlay Background */}
      {showMenuPanel && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onMenuToggle(false)}
        />
      )}

      {/* Menu Panel */}
      <motion.div
        ref={onRef}
        className={`h-screen bg-white border-r border-gray-200 overflow-hidden pt-16 px-4 pb-5 fixed lg:sticky top-0 left-0 z-50 lg:z-auto`}
        initial={false}
        animate={{
          x: showMenuPanel ? 0 : -256,
          opacity: showMenuPanel ? 1 : 0,
          width: showMenuPanel ? 256 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Room Name */}
        <h2 className="text-2xl font-semibold text-gray-600 mb-5 text-center">
          {roomId?.toUpperCase()}
        </h2>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 mb-6 pb-5">
          <Button
            onClick={() => {
              onPageChange("game");
              // Close menu on mobile after navigation
              if (window.innerWidth <= 768) {
                onMenuToggle(false);
              }
            }}
            variant={currentPage === "game" ? "primary" : "ghost"}
            size="md"
            fullWidth
            icon={<Gamepad size={18} />}
            className="justify-start hover:translate-x-1"
            title="Game"
          >
            Game
          </Button>

          <Button
            onClick={() => {
              onPageChange("settings");
              // Close menu on mobile after navigation
              if (window.innerWidth <= 768) {
                onMenuToggle(false);
              }
            }}
            variant={currentPage === "settings" ? "primary" : "ghost"}
            size="md"
            fullWidth
            icon={<Settings size={18} />}
            className="justify-start hover:translate-x-1"
            title="Settings"
          >
            Settings
          </Button>

          {isAdmin && (
            <Button
              onClick={() => {
                onPageChange("admin");
                // Close menu on mobile after navigation
                if (window.innerWidth <= 768) {
                  onMenuToggle(false);
                }
              }}
              variant={currentPage === "admin" ? "primary" : "ghost"}
              size="md"
              fullWidth
              icon={<Crown size={18} />}
              className="justify-start hover:translate-x-1"
              title="Admin"
            >
              Admin
            </Button>
          )}

          <Button
            onClick={handleLeaveRoom}
            variant="ghost"
            size="md"
            fullWidth
            icon={<LogOut size={18} />}
            className="justify-start hover:translate-x-1 text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Leave Room"
          >
            Leave
          </Button>
        </div>

        {/* Members Section */}
        <div className="mt-5">
          <h3 className="text-xl font-medium text-gray-600 mb-5 pb-2">Room</h3>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 italic py-5">
              No users in room yet...
            </p>
          ) : (
            <ul className="list-none p-0">
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.li
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 mb-2 bg-white border-none rounded-lg transition-all duration-300 relative hover:bg-blue-50 hover:border-blue-500 hover:border-2 hover:translate-x-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.15 }}
                  >
                    <UserIcon
                      size={16}
                      className="text-gray-600 flex-shrink-0"
                    />
                    <span className="font-medium text-gray-600 flex-1">
                      {user.name?.toUpperCase()}
                    </span>
                    <div className="flex gap-1">
                      {user.isPlayer && (
                        <Badge variant="primary" size="sm" title="Player">
                          <Gamepad size={14} />
                        </Badge>
                      )}
                      {user.isNarrator && (
                        <Badge variant="success" size="sm" title="Narrator">
                          <Mic size={14} />
                        </Badge>
                      )}
                      {user.isAdmin && (
                        <Badge variant="warning" size="sm" title="Admin">
                          <Crown size={14} />
                        </Badge>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>
    </>
  );
};
