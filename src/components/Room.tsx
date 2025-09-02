import React, { useState, useRef } from "react";
import { RoomHeader } from "./RoomHeader";
import { MembersPanel } from "./MembersPanel";
import { ContentRouter } from "./ContentRouter";
import { RoomProvider } from "../contexts/RoomContext";
import { useClickOutside } from "../hooks/useClickOutside";

export const Room: React.FC = () => {
  return (
    <RoomProvider>
      <RoomContent />
    </RoomProvider>
  );
};

const RoomContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"game" | "settings" | "admin">(
    "game"
  );
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  const membersPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside members panel on mobile
  useClickOutside(membersPanelRef, {
    onClickOutside: () => setShowMembersPanel(false),
    excludeRefs: [toggleButtonRef],
    mobileOnly: true,
    enabled: showMembersPanel,
  });

  const handleMembersPanelToggle = (show: boolean) => {
    setShowMembersPanel(show);
  };

  return (
    <div className="room">
      <RoomHeader
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onMembersPanelToggle={handleMembersPanelToggle}
      />

      <div className="room-main">
        <MembersPanel
          showMembersPanel={showMembersPanel}
          onRef={(ref) => {
            membersPanelRef.current = ref;
          }}
        />

        <ContentRouter currentPage={currentPage} />
      </div>
    </div>
  );
};
