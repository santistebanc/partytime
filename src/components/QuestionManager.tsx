import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { QuizQuestion } from "../types/quiz";
import { QuizQuestionEntry } from "./QuizQuestionEntry";
import { useSocketMessage } from '../hooks/useSocketMessage';
import { useRoomContext } from '../contexts/RoomContext';
import { generateId } from '../utils';

interface QuestionManagerProps {}

export const QuestionManager: React.FC<QuestionManagerProps> = () => {
  const { initialQuestions: questions, socket, revealState } = useRoomContext();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const sendMessage = useSocketMessage(socket);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index !== destination.index) {
      const newItems = Array.from(questions);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      // Send reorder to server
      sendMessage({
        type: 'reorderQuestions',
        questionIds: newItems.map(q => q.id)
      });
    }
  }, [questions, sendMessage]);

  const addQuestion = useCallback((question: Omit<QuizQuestion, "id">) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: generateId(),
    };
    
    // Send to server
    sendMessage({
      type: 'addQuestion',
      question: newQuestion
    });
  }, [sendMessage]);

  const updateQuestion = useCallback((updatedQuestion: QuizQuestion) => {
    // Send to server
    sendMessage({
      type: 'updateQuestion',
      question: updatedQuestion
    });
  }, [sendMessage]);

  const deleteQuestion = useCallback((id: string) => {
    // Send delete to server
    sendMessage({
      type: 'deleteQuestion',
      questionId: id
    });
  }, [sendMessage]);

  const handleRevealToggle = useCallback((questionId: string, revealed: boolean) => {
    // Send reveal state update to server
    sendMessage({
      type: 'updateRevealState',
      questionId,
      revealed
    });
  }, [sendMessage]);

  return (
    <div className="questions-section">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        Questions ({questions.length})
      </motion.h3>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="questions-list"
            >
              <AnimatePresence>
                {questions.map((question, index) => (
                  <Draggable
                    key={question.id}
                    draggableId={question.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, duration: 0.15 }}
                        style={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging
                            ? provided.draggableProps.style?.transform
                            : 'none',
                        }}
                      >
                        <QuizQuestionEntry
                          question={question}
                          onUpdate={updateQuestion}
                          onDelete={deleteQuestion}
                          isEditing={editingQuestionId === question.id}
                          onEditToggle={() => setEditingQuestionId(editingQuestionId === question.id ? null : question.id)}
                          dragHandleProps={provided.dragHandleProps}
                          isRevealed={!!revealState[question.id]}
                          onRevealToggle={handleRevealToggle}
                        />
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </AnimatePresence>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      

    </div>
  );
};
