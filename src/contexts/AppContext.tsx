import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { PartySocket } from "partysocket";
import type { GameState, User } from "../types";
import { generateUserId, generateRoomId } from "../utils";

// Simple localStorage helpers
const getStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStored = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
};

interface AppContextType {
  // Navigation
  roomId: string | null;
  userName: string | null;
  navigateToRoom: (roomId: string, userName: string) => void;
  navigateToLobby: () => void;
  createRoom: (userName: string) => void;

  // Connection
  isConnected: boolean;

  // Game State
  gameState: GameState;
  users: User[];
  connections: Record<string, string>;
  status: string;
  topics: string[];
  questions: any[];
  currentQuestionIndex: number;
  history: any[];
  currentRespondent: string;
  captions: string;
  currentUserId: string;
  isPlayer: boolean;
  isNarrator: boolean;
  isAdmin: boolean;
  revealedQuestions: Record<string, boolean>;

  // Actions
  sendMessage: (action: string, payload: any) => void;
  handleNameChange: (newName: string) => void;
  handlePlayerToggle: (value: boolean) => void;
  handleNarratorToggle: (value: boolean) => void;
  handleAdminToggle: (value: boolean) => void;

  // Game Actions
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  addQuestion: (question: any) => void;
  updateQuestion: (question: any) => void;
  updateRevealState: (questionId: string, revealed: boolean) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (questionIds: string[]) => void;
  generateQuestions: (topics: string[], count: number) => void;
  setGameStatus: (status: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentRespondent: (userId: string) => void;
  setCaptions: (captions: string) => void;
  addRound: (round: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Navigation state
  const urlParams = new URLSearchParams(window.location.search);
  const urlRoomId = urlParams.get("roomId") ?? null;
  const urlUserName = urlParams.get("userName") ?? null;
  const [roomId, setRoomId] = useState(urlRoomId);
  const [userName, setUserName] = useState(urlUserName);

  // Save roomId and userName to localStorage when they change
  useEffect(() => {
    if (roomId) {
      setStored("snapquiz-roomname", roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (userName) {
      setStored("snapquiz-username", userName);
    }
  }, [userName]);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    users: [],
    connections: {},
    status: "unstarted",
    topics: [],
    questions: [],
    currentQuestionIndex: 0,
    history: [],
    currentRespondent: "",
    captions: "",
  });

  // User state
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Local UI state with localStorage persistence
  const [revealedQuestions, setRevealedQuestions] = useState<
    Record<string, boolean>
  >(() => {
    try {
      const stored = localStorage.getItem("snapquiz_revealed_questions");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Optimistic state for all game actions
  const [optimisticState, setOptimisticState] = useState<{
    topics?: string[];
    questions?: any[];
    users?: User[];
    status?: string;
    currentQuestionIndex?: number;
    currentRespondent?: string;
    captions?: string;
    history?: any[];
  }>({});

  // Persist revealedQuestions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "snapquiz_revealed_questions",
        JSON.stringify(revealedQuestions)
      );
    } catch {
      // Ignore storage errors
    }
  }, [revealedQuestions]);

  // Navigation functions
  const updateURL = useCallback(
    (newRoomId: string | null, newUserName: string | null) => {
      const urlParams = new URLSearchParams();
      if (newRoomId && newUserName) {
        urlParams.set("roomId", newRoomId);
        urlParams.set("userName", newUserName);
      }
      const newURL = urlParams.toString()
        ? `?${urlParams.toString()}`
        : window.location.pathname;
      window.history.pushState({}, "", newURL);
    },
    []
  );

  const navigateToRoom = useCallback(
    (newRoomId: string, newUserName: string) => {
      setRoomId(newRoomId);
      setUserName(newUserName);
      updateURL(newRoomId, newUserName);
      // Save to localStorage with consistent keys
      setStored("snapquiz-username", newUserName);
      setStored("snapquiz-roomname", newRoomId);
    },
    [updateURL]
  );

  const navigateToLobby = useCallback(() => {
    setRoomId(null);
    setUserName(null);
    updateURL(null, null);
  }, [updateURL]);

  const createRoom = useCallback(
    (newUserName: string) => {
      const randomRoomId = generateRoomId();
      navigateToRoom(randomRoomId, newUserName);
    },
    [navigateToRoom]
  );

  // Socket management
  useEffect(() => {
    if (!roomId) return;

    const socket = new PartySocket({
      host:
        window.location.hostname === "localhost"
          ? "localhost:1999"
          : window.location.hostname,
      room: roomId,
      party: "room",
    });

    socketRef.current = socket;

    const handleOpen = () => {
      setIsConnected(true);

      // Auto-join when connected
      if (userName) {
        let userId = getStored("snapquiz_last_user_id");
        if (!userId) {
          userId = generateUserId();
          setStored("snapquiz_last_user_id", userId);
        }
        setCurrentUserId(userId);

        // Send join message
        socket.send(
          JSON.stringify({
            type: "stateChange",
            action: "join",
            payload: { name: userName, userId },
            userId,
            timestamp: Date.now(),
          })
        );
      }
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "stateUpdate" && data.success && data.state) {
          setGameState(data.state);

          // Clear optimistic updates when server state updates
          setOptimisticState({});

          // User toggles are now computed from gameState
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("message", handleMessage);
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomId, userName, currentUserId]);

  // Message sending
  const sendMessage = useCallback(
    (action: string, payload: any) => {
      if (isConnected && socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "stateChange",
            action,
            payload,
            userId: currentUserId,
            timestamp: Date.now(),
          })
        );
      }
    },
    [isConnected, currentUserId]
  );

  // User actions
  const handleNameChange = useCallback(
    (newName: string) => {
      if (currentUserId && userName) {
        sendMessage("changeName", {
          oldName: userName,
          newName,
          userId: currentUserId,
        });
      }
    },
    [currentUserId, userName, sendMessage]
  );

  const handlePlayerToggle = useCallback(
    (newValue: boolean) => {
      if (currentUserId) {
        sendMessage("updateUserToggles", {
          userId: currentUserId,
          isPlayer: newValue,
        });
      }
    },
    [currentUserId, sendMessage]
  );

  const handleNarratorToggle = useCallback(
    (newValue: boolean) => {
      if (currentUserId) {
        sendMessage("updateUserToggles", {
          userId: currentUserId,
          isNarrator: newValue,
        });
      }
    },
    [currentUserId, sendMessage]
  );

  const handleAdminToggle = useCallback(
    (newValue: boolean) => {
      if (currentUserId) {
        sendMessage("updateUserToggles", {
          userId: currentUserId,
          isAdmin: newValue,
        });
      }
    },
    [currentUserId, sendMessage]
  );

  const updateRevealState = useCallback(
    (questionId: string, revealed: boolean) => {
      setRevealedQuestions((prev) => ({
        ...prev,
        [questionId]: revealed,
      }));
    },
    []
  );

  // Game Actions with optimistic updates
  const addTopic = useCallback(
    (topic: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        topics: [...(prev.topics || gameState.topics), topic],
      }));
      sendMessage("addTopic", { topic });
    },
    [sendMessage, gameState.topics]
  );

  const removeTopic = useCallback(
    (topic: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        topics: (prev.topics || gameState.topics).filter((t) => t !== topic),
      }));
      sendMessage("removeTopic", { topic });
    },
    [sendMessage, gameState.topics]
  );

  const addQuestion = useCallback(
    (question: any) => {
      setOptimisticState((prev) => ({
        ...prev,
        questions: [...(prev.questions || gameState.questions), question],
      }));
      sendMessage("addQuestion", { question });
    },
    [sendMessage, gameState.questions]
  );

  const updateQuestion = useCallback(
    (question: any) => {
      setOptimisticState((prev) => ({
        ...prev,
        questions: (prev.questions || gameState.questions).map((q) =>
          q.id === question.id ? question : q
        ),
      }));
      sendMessage("updateQuestion", { question });
    },
    [sendMessage, gameState.questions]
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        questions: (prev.questions || gameState.questions).filter(
          (q) => q.id !== questionId
        ),
      }));
      sendMessage("deleteQuestion", { questionId });
    },
    [sendMessage, gameState.questions]
  );

  const reorderQuestions = useCallback(
    (questionIds: string[]) => {
      const reorderedQuestions = questionIds
        .map((id) =>
          (optimisticState.questions || gameState.questions).find(
            (q) => q.id === id
          )
        )
        .filter(Boolean);

      setOptimisticState((prev) => ({
        ...prev,
        questions: reorderedQuestions,
      }));
      sendMessage("reorderQuestions", { questionIds });
    },
    [sendMessage, gameState.questions, optimisticState.questions]
  );

  const generateQuestions = useCallback(
    (topics: string[], count: number) => {
      // For AI generation, we don't know the exact questions yet, so we'll let the server handle it
      sendMessage("generateQuestions", { topics, count });
    },
    [sendMessage]
  );

  const setGameStatus = useCallback(
    (status: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        status,
      }));
      sendMessage("setGameStatus", { status });
    },
    [sendMessage]
  );

  const setCurrentQuestionIndex = useCallback(
    (index: number) => {
      setOptimisticState((prev) => ({
        ...prev,
        currentQuestionIndex: index,
      }));
      sendMessage("setCurrentQuestionIndex", { index });
    },
    [sendMessage]
  );

  const setCurrentRespondent = useCallback(
    (userId: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        currentRespondent: userId,
      }));
      sendMessage("setCurrentRespondent", { userId });
    },
    [sendMessage]
  );

  const setCaptions = useCallback(
    (captions: string) => {
      setOptimisticState((prev) => ({
        ...prev,
        captions,
      }));
      sendMessage("setCaptions", { captions });
    },
    [sendMessage]
  );

  const addRound = useCallback(
    (round: any) => {
      setOptimisticState((prev) => ({
        ...prev,
        history: [...(gameState.history || []), round],
      }));
      sendMessage("addRound", { round });
    },
    [sendMessage, gameState.history]
  );

  const value: AppContextType = {
    // Navigation
    roomId,
    userName,
    navigateToRoom,
    navigateToLobby,
    createRoom,

    // Connection
    isConnected,

    // Game State (using optimistic state when available)
    gameState,
    users: optimisticState.users || gameState.users,
    connections: gameState.connections,
    status: optimisticState.status || gameState.status,
    topics: optimisticState.topics || gameState.topics,
    questions: optimisticState.questions || gameState.questions,
    currentQuestionIndex:
      optimisticState.currentQuestionIndex ?? gameState.currentQuestionIndex,
    history: optimisticState.history || gameState.history,
    currentRespondent:
      optimisticState.currentRespondent || gameState.currentRespondent,
    captions: optimisticState.captions || gameState.captions,
    currentUserId,
    isPlayer:
      (optimisticState.users || gameState.users).find(
        (u) => u.id === currentUserId
      )?.isPlayer ?? false,
    isNarrator:
      (optimisticState.users || gameState.users).find(
        (u) => u.id === currentUserId
      )?.isNarrator ?? false,
    isAdmin:
      (optimisticState.users || gameState.users).find(
        (u) => u.id === currentUserId
      )?.isAdmin ?? false,
    revealedQuestions,

    // Actions
    sendMessage,
    handleNameChange,
    handlePlayerToggle,
    handleNarratorToggle,
    handleAdminToggle,
    updateRevealState,

    // Game Actions
    addTopic,
    removeTopic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    generateQuestions,
    setGameStatus,
    setCurrentQuestionIndex,
    setCurrentRespondent,
    setCaptions,
    addRound,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
