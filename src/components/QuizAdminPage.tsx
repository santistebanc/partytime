import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Wand2, AlertCircle } from "lucide-react";
import type { QuizQuestion } from "../types/quiz";
import { QuizQuestionEntry } from "./QuizQuestionEntry";
import { TopicManager } from "./TopicManager";
import { aiService } from "../services/aiService";
import { useSocket } from "../contexts/SocketContext";

interface QuizAdminPageProps {
  initialQuestions?: QuizQuestion[];
  initialTopics?: string[];
  socket?: any; // PartySocket instance
}

export const QuizAdminPage: React.FC<QuizAdminPageProps> = ({
  initialQuestions = [],
  initialTopics = [],
  socket,
}) => {
  const { socket: contextSocket } = useSocket();
  const activeSocket = socket || contextSocket;
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [topics, setTopics] = useState<string[]>(initialTopics);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index !== destination.index) {
      const newItems = Array.from(questions);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      
      // Update local state immediately for responsiveness
      setQuestions(newItems);
      
      // Send reorder to server
      if (activeSocket) {
        activeSocket.send(JSON.stringify({
          type: 'reorderQuestions',
          questionIds: newItems.map(q => q.id)
        }));
      }
    }
  }, [questions, activeSocket]);

  const addQuestion = useCallback((question: Omit<QuizQuestion, "id">) => {
    const newQuestion: QuizQuestion = {
      ...question,
      id: crypto.randomUUID(),
    };
    
    // Update local state immediately for responsiveness
    setQuestions((prev) => [...prev, newQuestion]);
    
    // Send to server
    if (activeSocket) {
      activeSocket.send(JSON.stringify({
        type: 'addQuestion',
        question: newQuestion
      }));
    }
  }, [activeSocket]);

  const updateQuestion = useCallback((updatedQuestion: QuizQuestion) => {
    // Update local state immediately for responsiveness
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
    
    // Send to server
    if (activeSocket) {
      activeSocket.send(JSON.stringify({
        type: 'updateQuestion',
        question: updatedQuestion
      }));
    }
  }, [activeSocket]);

  const deleteQuestion = useCallback((id: string) => {
    // Update local state immediately for responsiveness
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    
    // Send delete to server
    if (activeSocket) {
      activeSocket.send(JSON.stringify({
        type: 'deleteQuestion',
        questionId: id
      }));
    }
  }, [activeSocket]);

  const toggleEditQuestion = useCallback((id: string) => {
    setEditingQuestionId((prev) => (prev === id ? null : id));
  }, []);

  const handleTopicsChange = useCallback((newTopics: string[]) => {
    setTopics(newTopics);
    
    // Send topic changes to server
    if (activeSocket) {
      // Find added topics
      const addedTopics = newTopics.filter(topic => !topics.includes(topic));
      addedTopics.forEach(topic => {
        activeSocket.send(JSON.stringify({
          type: 'addTopic',
          topic: topic
        }));
      });
      
      // Find removed topics
      const removedTopics = topics.filter(topic => !newTopics.includes(topic));
      removedTopics.forEach(topic => {
        activeSocket.send(JSON.stringify({
          type: 'removeTopic',
          topic: topic
        }));
      });
    }
  }, [topics, activeSocket]);

  const generateQuestions = useCallback(async () => {
    if (topics.length === 0) {
      setError("Please add at least one topic first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiService.generateQuizQuestions({
        topics: topics,
        count: 5,
      });

      response.questions.forEach((question) => {
        addQuestion(question);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [topics, addQuestion]);

  const getTotalPoints = () => {
    return questions.reduce((total, q) => total + q.points, 0);
  };

  // Set socket in AI service when available
  useEffect(() => {
    if (socket) {
      aiService.setSocket(socket);
    }
  }, [socket]);

  // Update questions when initialQuestions prop changes
  useEffect(() => {
    console.log('QuizAdminPage: initialQuestions prop changed:', initialQuestions);
    if (initialQuestions.length > 0) {
      console.log("Setting initial questions from props:", initialQuestions);
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Update topics when initialTopics prop changes
  useEffect(() => {
    console.log('QuizAdminPage: initialTopics prop changed:', initialTopics);
    if (initialTopics.length > 0) {
      console.log("Setting initial topics from props:", initialTopics);
      setTopics(initialTopics);
    }
  }, [initialTopics]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="quiz-admin-page"
    >
      <div className="admin-header">
        <h2>Quiz Game Admin</h2>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <div className="questions-header">
            <button
              onClick={generateQuestions}
              disabled={topics.length === 0 || isGenerating}
              className="btn-generate"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Wand2 size={16} />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate
                </>
              )}
            </button>
            <TopicManager topics={topics} onTopicsChange={handleTopicsChange} />
          </div>

          <div className="questions-stats">
            <div className="stat-box">
              <span className="stat-number">{questions.length}</span>
              <span className="stat-label">questions</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{getTotalPoints()}</span>
              <span className="stat-label">total points</span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-message"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          {questions.length === 0 ? (
            <div className="no-questions">
              <p>
                No Questions added yet. Generate some questions to get started!
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
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
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "dragging" : ""}
                          >
                            <QuizQuestionEntry
                              question={question}
                              onUpdate={updateQuestion}
                              onDelete={deleteQuestion}
                              isEditing={editingQuestionId === question.id}
                              onEditToggle={toggleEditQuestion}
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
          )}
        </div>
      </div>
    </motion.div>
  );
};
