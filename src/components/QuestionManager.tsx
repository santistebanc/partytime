import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { QuizQuestionEntry } from "./QuizQuestionEntry";
import { useSocketMessage } from "../hooks/useSocketMessage";
import { useRoomContext } from "../contexts/RoomContext";

interface QuestionManagerProps {}

export const QuestionManager: React.FC<QuestionManagerProps> = () => {
  const { gameState, socket } = useRoomContext();

  const sendMessage = useSocketMessage(socket);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;

      if (source.index !== destination.index) {
        const newItems = Array.from(gameState.questions);
        const [removed] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, removed);

        // Send reorder to server
        sendMessage({
          type: "reorderQuestions",
          questionIds: newItems.map((q) => q.id),
        });
      }
    },
    [gameState.questions, sendMessage]
  );

  const deleteQuestion = useCallback(
    (id: string) => {
      // Send delete to server
      sendMessage({
        type: "deleteQuestion",
        questionId: id,
      });
    },
    [sendMessage]
  );

  const handleRevealToggle = useCallback(
    (questionId: string, revealed: boolean) => {
      // Send reveal state update to server
      sendMessage({
        type: "updateRevealState",
        questionId,
        revealed,
      });
    },
    [sendMessage]
  );

  return (
    <div className="questions-section">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        Questions ({gameState.questions.length})
      </motion.h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              className="questions-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {gameState.questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "dragging" : ""}
                    >
                      <QuizQuestionEntry
                        question={question}
                        onDelete={deleteQuestion}
                        isRevealed={false}
                        onRevealToggle={handleRevealToggle}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
