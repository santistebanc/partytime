# Unified Messaging Refactor

## Overview
This refactor changes the app from using multiple message types for different state changes to a single unified message type that handles all state changes. Every client then updates their local state based on the single state update message from the server.

## Key Changes

### 1. New Unified Message Types (`src/types/UnifiedMessage.ts`)
- **UnifiedMessage**: Single message type with `type: 'stateChange'`
- **StateChangeAction**: Enum of all possible actions (join, leave, changeName, etc.)
- **StateUpdateResponse**: Unified response format with success/error status
- **Payload Types**: Specific payload interfaces for each action

### 2. Server-Side Changes

#### MessageHandler (`src/server/MessageHandler.ts`)
- **New unified message handling**: `handleStateChange()` method processes all state changes
- **Backward compatibility**: Legacy message types still supported
- **Error handling**: Unified error responses with proper error messages
- **New handlers**: Added handlers for game status, question index, respondent, captions, and rounds

#### GameStateManager (`src/server/GameStateManager.ts`)
- **Unified broadcasting**: All state changes now broadcast as `stateUpdate` messages
- **Consistent response format**: All responses include success status and timestamp

### 3. Client-Side Changes

#### New Hook (`src/hooks/useUnifiedMessage.ts`)
- **Unified message sending**: Single hook for all state change operations
- **Convenience methods**: Pre-built methods for common actions (join, changeName, etc.)
- **Type safety**: Full TypeScript support for all message types

#### Updated Components
- **RoomContext**: Now uses unified messaging and handles `stateUpdate` responses
- **QuestionManager**: Updated to use unified message methods
- **Topic Management**: Refactored to use unified messaging
- **AI Generation**: Updated to use unified messaging

### 4. Message Flow

#### Before (Multiple Message Types)
```
Client -> Server: { type: 'join', name: 'John', userId: '123' }
Server -> All Clients: { type: 'gameState', state: {...} }

Client -> Server: { type: 'addQuestion', question: {...} }
Server -> All Clients: { type: 'gameState', state: {...} }

Client -> Server: { type: 'updateUserToggles', userId: '123', isPlayer: true }
Server -> All Clients: { type: 'gameState', state: {...} }
```

#### After (Unified Messaging)
```
Client -> Server: { type: 'stateChange', action: 'join', payload: { name: 'John', userId: '123' } }
Server -> All Clients: { type: 'stateUpdate', state: {...}, success: true, timestamp: 1234567890 }

Client -> Server: { type: 'stateChange', action: 'addQuestion', payload: { question: {...} } }
Server -> All Clients: { type: 'stateUpdate', state: {...}, success: true, timestamp: 1234567890 }

Client -> Server: { type: 'stateChange', action: 'updateUserToggles', payload: { userId: '123', isPlayer: true } }
Server -> All Clients: { type: 'stateUpdate', state: {...}, success: true, timestamp: 1234567890 }
```

## Benefits

1. **Consistency**: All state changes follow the same message pattern
2. **Error Handling**: Unified error responses with proper error messages
3. **Type Safety**: Full TypeScript support for all message types
4. **Maintainability**: Single message handler pattern is easier to maintain
5. **Debugging**: Easier to debug with consistent message format
6. **Extensibility**: Easy to add new state change actions
7. **Backward Compatibility**: Legacy message types still supported during transition

## Migration Notes

- **Legacy Support**: Old message types are still supported for backward compatibility
- **Gradual Migration**: Components can be migrated one at a time
- **No Breaking Changes**: Existing functionality continues to work
- **Performance**: No performance impact, same number of messages sent

## Testing

The refactor maintains full backward compatibility, so existing functionality should continue to work without any changes. The unified messaging system provides:

- Consistent state updates across all clients
- Proper error handling and reporting
- Type-safe message sending and receiving
- Easy debugging with unified message format
