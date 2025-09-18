import React, { useState } from "react";
import { motion } from "framer-motion";

import { useApp } from "../contexts/AppContext";
import { SnapQuizLogo } from "./SnapQuizLogo";
import { Button, Input, Card } from "./ui";
import { AppLayout, ContentLayout, FadeIn, StaggeredList } from "./layout";

export const Lobby: React.FC = () => {
  const { roomId, userName, navigateToRoom, createRoom } = useApp();

  // Form state with priority: URL params → localStorage → empty
  const [formName, setFormName] = useState(() => {
    return (userName ?? localStorage.getItem("snapquiz-username") ?? "").toUpperCase();
  });

  const [formRoomId, setFormRoomId] = useState(() => {
    return (roomId ?? localStorage.getItem("snapquiz-roomname") ?? "").toUpperCase();
  });

  const isNameValid = formName.length >= 2 && formName.length <= 20;

  const handleNameChange = (value: string) => {
    setFormName(value.toUpperCase());
  };

  const handleRoomIdChange = (value: string) => {
    setFormRoomId(value.toUpperCase());
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) return;

    // If room ID is empty, create a new room
    if (formRoomId === "") {
      createRoom(formName);
    } else {
      navigateToRoom(formRoomId, formName);
    }
  };

  return (
    <AppLayout
      background="gray"
      minHeight="screen"
      className="flex items-center justify-center"
    >
      <ContentLayout maxWidth="md" center className="text-center">
        <Card className="bg-gray-50" padding="lg" shadow="md" animate>
          <FadeIn direction="down" delay={0.1}>
            <div className="flex justify-center mb-8">
              <SnapQuizLogo size="20svh" />
            </div>
          </FadeIn>

          <StaggeredList
            className="flex flex-col gap-6 w-full"
            staggerDelay={0.1}
          >
            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col gap-6 w-full"
            >
              <div className="text-left">
                <Input
                  id="name"
                  type="text"
                  label="Your Name"
                  placeholder="Enter your name"
                  value={formName}
                  onChange={handleNameChange}
                  error={
                    formName.length > 0 && !isNameValid
                      ? formName.length < 2
                        ? "Name must be at least 2 characters"
                        : "Name must be 20 characters or less"
                      : undefined
                  }
                  maxLength={20}
                  required
                  autoFocus
                  className="px-6 py-4 text-lg rounded-2xl"
                />
              </div>

              <div className="text-left">
                <Input
                  id="room"
                  type="text"
                  label="Room Name"
                  placeholder="Leave empty to create a new room"
                  value={formRoomId}
                  onChange={handleRoomIdChange}
                  className="px-6 py-4 text-lg rounded-2xl"
                />
              </div>

              <Button
                type="submit"
                disabled={!isNameValid}
                variant="primary"
                size="lg"
                fullWidth
                className="px-8 py-4 rounded-2xl text-lg"
              >
                {formRoomId === "" ? "Create Room" : "Join Room"}
              </Button>
            </form>
          </StaggeredList>
        </Card>
      </ContentLayout>
    </AppLayout>
  );
};
