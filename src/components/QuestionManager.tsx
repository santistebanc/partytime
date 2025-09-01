import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { QuizQuestion } from "../types/quiz";
import { QuizQuestionEntry } from "./QuizQuestionEntry";

interface QuestionManagerProps {
  questions: QuizQuestion[];
  onQuestionsChange: (questions: QuizQuestion[]) => void;
  onQuestionAdd: (question: Omit<QuizQuestion, "id">) => void;
  onQuestionUpdate: (question: QuizQuestion) => void;
  onQuestionDelete: (id: string) => void;
  onReorder: (questionIds: string[]) => void;
  socket: any;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  questions,
  onQuestionsChange,
  onQuestionAdd,
  onQuestionUpdate,
  onQuestionDelete,
  onReorder,
  socket
}) => {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index !== destination.index) {
      const newItems = Array.from(questions);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      // Update local state immediately for responsiveness
      onQuestionsChange(newItems);
      
      // Send reorder to server
      if (socket) {
        socket.send(JSON.stringify({
          type: 'reorderQuestions',
          questionIds: newItems.map(q => q.id)
        }));
      }
      
      // Call the reorder callback
      onReorder(newItems.map(q => q.id));
    }
  }, [questions, socket, onQuestionsChange, onReorder]);

  const addQuestion = useCallback((question: Omit<QuizQuestion, "id">) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: crypto.randomUUID(),
    };
    
    // Update local state immediately for responsiveness
    onQuestionsChange([...questions, newQuestion]);
    
    // Send to server
    if (socket) {
      socket.send(JSON.stringify({
        type: 'addQuestion',
        question: newQuestion
      }));
    }
    
    // Call the add callback
    onQuestionAdd(question);
  }, [questions, socket, onQuestionsChange, onQuestionAdd]);

  const updateQuestion = useCallback((updatedQuestion: QuizQuestion) => {
    // Update local state immediately for responsiveness
    onQuestionsChange(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
    
    // Send to server
    if (socket) {
      socket.send(JSON.stringify({
        type: 'updateQuestion',
        question: updatedQuestion
      }));
    }
    
    // Call the update callback
    onQuestionUpdate(updatedQuestion);
  }, [questions, socket, onQuestionsChange, onQuestionUpdate]);

  const deleteQuestion = useCallback((id: string) => {
    // Update local state immediately for responsiveness
    onQuestionsChange(questions.filter((q) => q.id !== id));
    
    // Send delete to server
    if (socket) {
      socket.send(JSON.stringify({
        type: 'deleteQuestion',
        questionId: id
      }));
    }
    
    // Call the delete callback
    onQuestionDelete(id);
  }, [questions, socket, onQuestionsChange, onQuestionDelete]);

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
