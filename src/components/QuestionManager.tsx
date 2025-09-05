import React, { useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { QuizQuestionEntry } from "./QuizQuestionEntry";
import { useApp } from "../contexts/AppContext";

export const QuestionManager: React.FC = () => {
  const { questions, reorderQuestions, deleteQuestion, updateRevealState, revealedQuestions } =
    useApp();
  
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Find the scroll container (the element with overflow-y-auto)
  useEffect(() => {
    const findScrollContainer = () => {
      let element = document.querySelector('.overflow-y-auto');
      if (element) {
        scrollContainerRef.current = element as HTMLElement;
      }
    };
    
    findScrollContainer();
  }, []);

  // DraggableItem component that uses portal for drag preview
  const DraggableItem = ({ provided, snapshot, children }: any) => {
    const portal = document.getElementById('draggable-portal');

    const child = (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={provided.draggableProps.style}
        className={snapshot.isDragging ? "dragging" : ""}
      >
        {children}
      </div>
    );

    if (snapshot.isDragging && portal) {
      return createPortal(child, portal);
    }

    return child;
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;

      if (source.index !== destination.index) {
        const newItems = Array.from(questions);
        const [removed] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, removed);

        // Send reorder to server
        reorderQuestions(newItems.map((q) => q.id));
      }
    },
    [questions, reorderQuestions]
  );

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      // Send delete to server
      deleteQuestion(id);
    },
    [deleteQuestion]
  );

  const handleRevealToggle = useCallback(
    (questionId: string, revealed: boolean) => {
      // Send reveal state update to server
      updateRevealState(questionId, revealed);
    },
    [updateRevealState]
  );

  return (
    <div className="questions-section">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        Questions ({questions.length})
      </motion.h3>

      <DragDropContext 
        onDragEnd={handleDragEnd}
        onBeforeDragStart={(start) => {
          // Find the scroll container and ensure it's properly configured
          const scrollContainer = document.querySelector('.overflow-y-auto') as HTMLElement;
          if (scrollContainer) {
            scrollContainerRef.current = scrollContainer;
            // The library should handle scroll offset automatically
            // but we ensure the container is properly detected
          }
        }}
      >
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              className="questions-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <DraggableItem provided={provided} snapshot={snapshot}>
                      <QuizQuestionEntry
                        question={question}
                        onDelete={handleDeleteQuestion}
                        isRevealed={revealedQuestions[question.id] || false}
                        onRevealToggle={handleRevealToggle}
                      />
                    </DraggableItem>
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
