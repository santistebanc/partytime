# Partytime - Quiz Game App

A real-time multiplayer quiz game built with PartyKit and React in TypeScript. Users can join rooms, participate in quiz games, chat with other players, and customize their experience with multiple themes.

## Features

### 🎮 **Game Features**
- **Real-time multiplayer quiz games** with automatic room assignment
- **Buzzer system** - first player to buzz gets to answer
- **Voice recognition** for answering questions
- **Text-to-speech** narration for questions (narrator mode)
- **Point system** with correct/incorrect answer scoring
- **Game history** tracking all questions and answers
- **Winners screen** with confetti animation

### 👥 **User Management**
- **Three user roles**: Player, Narrator, and Admin
- **Automatic room hosting** - first user becomes admin
- **Random display names** assigned automatically
- **Editable display names** in settings
- **Friends list** showing all users in the room

### 🎨 **Customization**
- **5 beautiful themes**: Classic, Dark, Warm, Ocean, and Neon
- **Easy theme switching** with live preview
- **Responsive design** that works on all devices

### 💬 **Communication**
- **Real-time chat** with bubble messages
- **Room sharing** - copy room ID to invite friends
- **User status indicators** showing roles and points

### ⚙️ **Admin Features**
- **Question management** with drag & drop reordering
- **AI question generation** based on topics
- **Game controls** (start, next question, reset)
- **Question blurring** for admin players
- **User role management**

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd partytime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:1999`

### Building for Production

```bash
npm run build
npm run deploy
```

## How to Play

### 🚀 **Starting a Game**

1. **Open the app** - you'll automatically be assigned to a room
2. **Share the room ID** with friends (copy from the header)
3. **Set user roles**:
   - **Player**: Can participate in the game
   - **Narrator**: Will hear questions read aloud
   - **Admin**: Can manage questions and control the game

### 🎯 **Playing the Game**

1. **Admin adds questions** in the Settings page
2. **Click "Start Game"** to begin
3. **Players buzz in** by clicking the large BUZZ button
4. **First to buzz** gets to answer the question
5. **Speak your answer** clearly into the microphone
6. **Points are awarded** based on correctness
7. **Admin advances** to the next question

### 💬 **Using Chat**

- **Click the chat icon** in the header
- **Type messages** in the input field
- **Send with Enter** or click the send button
- **See real-time updates** from all users

### ⚙️ **Customizing Settings**

- **Change your name** in the Display Name section
- **Select a theme** from 5 beautiful options
- **Manage questions** (admin only)
- **Control game flow** (admin only)

## Technical Details

### 🏗️ **Architecture**
- **Frontend**: React 18 + TypeScript
- **Backend**: PartyKit server with real-time WebSocket connections
- **Styling**: Custom CSS with CSS variables for theming
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography

### 🔌 **Key Components**
- **PartyKit Server**: Handles room management and game state
- **usePartyKit Hook**: Manages WebSocket connections and state
- **Theme System**: CSS variables with JavaScript theme switching
- **Voice Recognition**: Web Speech API integration
- **Responsive Layout**: Mobile-first design with sidebar navigation

### 🌐 **Real-time Features**
- **WebSocket connections** via PartyKit
- **Room-based messaging** for game state and chat
- **Automatic reconnection** handling
- **State synchronization** across all connected clients

## Browser Support

- **Chrome/Edge**: Full support (including voice features)
- **Firefox**: Full support (voice features may vary)
- **Safari**: Full support (voice features may vary)
- **Mobile browsers**: Responsive design with touch support

## Voice Features

### 🎤 **Speech Recognition**
- **Automatic transcription** of spoken answers
- **Real-time feedback** during speech
- **Fallback to manual input** if voice fails

### 🔊 **Text-to-Speech**
- **Question narration** for narrator users
- **Gameshow-style voice** with adjustable speed/pitch
- **Automatic playback** when questions change

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your browser supports Web Speech API
3. Try refreshing the page or rejoining the room
4. Check that all users have stable internet connections

---

**Have fun playing Partytime! 🎉**
