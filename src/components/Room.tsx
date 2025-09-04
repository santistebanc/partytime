import React, { useState, useRef } from "react";
import { MenuPanel } from "./MenuPanel";
import { ContentRouter } from "./ContentRouter";
import { useClickOutside } from "../hooks/useClickOutside";

export const Room: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"game" | "settings" | "admin">(
    "game"
  );
  const [showMenuPanel, setShowMenuPanel] = useState(false);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside menu panel on mobile
  useClickOutside(menuPanelRef, {
    onClickOutside: () => setShowMenuPanel(false),
    excludeRefs: [toggleButtonRef],
    mobileOnly: true,
    enabled: showMenuPanel,
  });

  const handleMenuPanelToggle = (show: boolean) => {
    setShowMenuPanel(show);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating Menu Toggle Button - Always Visible */}
      <button 
        ref={toggleButtonRef}
        onClick={() => handleMenuPanelToggle(!showMenuPanel)}
        className={`fixed top-4 left-4 z-50 p-3 border border-gray-200 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-soft hover:-translate-y-0.5 ${
          showMenuPanel 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title={showMenuPanel ? 'Hide Menu' : 'Show Menu'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div className="flex flex-1 min-h-screen">
        <MenuPanel
          showMenuPanel={showMenuPanel}
          onRef={(ref) => {
            menuPanelRef.current = ref;
          }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onMenuToggle={handleMenuPanelToggle}
          toggleButtonRef={toggleButtonRef}
        />

        <div className="flex-1 p-6 bg-white overflow-y-auto backdrop-blur-soft min-h-screen flex flex-col">
          <ContentRouter currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
};
