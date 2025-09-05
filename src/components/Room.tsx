import React, { useState, useRef } from "react";
import { MenuPanel } from "./MenuPanel";
import { ContentRouter } from "./ContentRouter";
import { useClickOutside } from "../hooks/useClickOutside";
import { IconButton } from "./ui";
import { AppLayout, ContentLayout } from "./layout";

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
    <AppLayout background="white" minHeight="screen" className="flex flex-col">
      {/* Floating Menu Toggle Button - Always Visible */}
      <div className="fixed top-4 left-4 z-[60]">
        <IconButton
          ref={toggleButtonRef}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          }
          onClick={() => handleMenuPanelToggle(!showMenuPanel)}
          variant="ghost"
          size="md"
          title={showMenuPanel ? 'Hide Menu' : 'Show Menu'}
          className="shadow-lg hover:-translate-y-0.5 bg-white border border-gray-300 hover:shadow-xl"
        />
      </div>

      <div className="flex flex-1 min-h-screen relative">
        {/* Menu Panel - Fixed positioned but takes space on large screens */}
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

        {/* Content Area - Responsive width with smooth transitions */}
        <ContentLayout 
          className={`flex-1 overflow-y-auto backdrop-blur-soft min-h-screen flex flex-col transition-all duration-200 ease-in-out ${
            showMenuPanel 
              ? 'w-full lg:w-auto lg:flex-1' 
              : 'w-full'
          }`}
          padding="none"
          maxWidth="full"
          center={false}
        >
          <ContentRouter currentPage={currentPage} />
        </ContentLayout>
      </div>
    </AppLayout>
  );
};
