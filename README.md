# Partytime - Party Lobby App

A real-time party lobby application built with PartyKit, React, and TypeScript that allows users to create and join rooms for real-time communication.

## Features

- **Lobby Screen**: Enter your name and choose to create or join a room
- **Name Validation**: Names must be 2-20 characters long
- **Create Room**: Automatically generates a random room ID
- **Join Room**: Enter an existing room ID to join
- **Real-time Updates**: See all users in the room in real-time
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Environment Setup

To use the AI-powered quiz question generation feature, you'll need to set up environment variables:

1. Create a `.env` file in the root directory
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```
3. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

**Note**: Environment variables in PartyKit are only available server-side. The client communicates with the server to access AI features.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd partytime
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:1999`

## How to Use

### Lobby Screen
1. Enter your name (2-20 characters)
2. Choose one of the following options:
   - **Create Room**: Generates a random room ID and takes you to the room
   - **Join Room**: Shows an input field to enter an existing room ID

### Room Screen
- Displays the room ID prominently
- Shows your name
- Lists all users currently in the room
- "Leave Room" button to return to the lobby

## Technical Details

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM for client-side navigation
- **Real-time**: PartyKit for WebSocket connections
- **Styling**: Modern CSS with gradients and glassmorphism effects
- **Build**: PartyKit with esbuild for fast development

## Project Structure

```
src/
├── components/
│   ├── Lobby.tsx      # Lobby screen component
│   └── Room.tsx       # Room screen component
├── client.tsx         # Main React app entry point
├── lobby.ts           # PartyKit lobby server
├── room.ts            # PartyKit room server
└── styles.css         # Global styles
```

## Development

- The app uses PartyKit for real-time functionality
- Lobby server manages room creation and user management
- Room server handles individual room connections and user lists
- All communication is done via WebSocket messages

## Deployment

To deploy to PartyKit:

```bash
npm run deploy
```

## License

MIT
