# Server Module Architecture

This directory contains the refactored server-side code, broken down into focused modules with single responsibilities.

## Module Overview

### `UserManager.ts`
**Responsibility**: Manages all user-related operations and state
- User creation, updates, and removal
- Connection management (multiple connections per user)
- User toggle states (player, narrator, admin)
- Persistent storage operations for user data

**Key Methods**:
- `addUser(userId, name, isFirstUser)`: Creates a new user
- `updateUserName(userId, newName)`: Updates user's display name
- `addConnection(connectionId, userId)`: Maps connection to user
- `updateUserToggles(userId, toggles)`: Updates user permissions
- `saveUserTogglesToStorage()`: Persists user data to room storage

### `QuizManager.ts`
**Responsibility**: Handles all quiz-related data and operations
- Question CRUD operations
- Topic management
- Initial question generation
- Room storage for quiz data

**Key Methods**:
- `getQuestions()`: Retrieves all questions from storage
- `addQuestion(question)`: Adds a new question
- `updateQuestion(question)`: Updates existing question
- `generateInitialQuestions()`: Creates default questions for new rooms
- `getTopics()`: Retrieves available topics

### `MessageHandler.ts`
**Responsibility**: Processes and routes all incoming WebSocket messages
- Message parsing and validation
- Delegates to appropriate managers
- Response formatting and sending
- Error handling for message processing

**Key Methods**:
- `handleMessage(message, sender)`: Main message router
- `handleJoin(data, sender)`: User join logic
- `handleNameChange(data, sender)`: Name update handling
- `handleUpdateUserToggles(data, sender)`: Toggle state updates

### `ConnectionManager.ts`
**Responsibility**: Manages WebSocket connection lifecycle
- Connection establishment
- Connection cleanup and user removal
- Broadcast operations for user updates

**Key Methods**:
- `onConnect(conn, ctx)`: Handles new connections
- `onClose(conn)`: Handles connection closures
- `broadcastUsers()`: Sends user list updates

## Benefits of This Architecture

### **Single Responsibility Principle**
Each module has one clear purpose, making the code easier to understand and maintain.

### **Separation of Concerns**
- User logic is isolated from quiz logic
- Message handling is separate from business logic
- Connection management is independent of data operations

### **Testability**
Each module can be tested independently with mock dependencies.

### **Maintainability**
- Changes to user logic don't affect quiz logic
- New message types can be added without touching other modules
- Business logic is separated from PartyKit-specific code

### **Reusability**
Modules can be reused in other contexts or extended with new functionality.

## Usage Example

```typescript
// In the main RoomServer class
export default class RoomServer implements Party.Server {
  private userManager: UserManager;
  private quizManager: QuizManager;
  private messageHandler: MessageHandler;
  private connectionManager: ConnectionManager;

  constructor(readonly room: Party.Room) {
    this.userManager = new UserManager(room);
    this.quizManager = new QuizManager(room);
    this.messageHandler = new MessageHandler(
      this.userManager, 
      this.quizManager, 
      room
    );
    this.connectionManager = new ConnectionManager(this.userManager, room);
  }

  async onMessage(message: string, sender: Party.Connection) {
    await this.messageHandler.handleMessage(message, sender);
  }
}
```

## Adding New Features

### **New Message Type**
1. Add the case in `MessageHandler.handleMessage()`
2. Create a private handler method
3. Implement the business logic using appropriate managers

### **New User Functionality**
1. Add methods to `UserManager`
2. Update the `User` interface if needed
3. Call from `MessageHandler` as appropriate

### **New Quiz Features**
1. Add methods to `QuizManager`
2. Update the `QuizQuestion` interface if needed
3. Integrate with existing message handling

## Data Flow

```
WebSocket Message → MessageHandler → UserManager/QuizManager → Room Storage
                                      ↓
                                Response → Client
```

This architecture provides a clean, maintainable foundation for the quiz application server.
