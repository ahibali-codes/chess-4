# Four Player Chess

A real-time multiplayer 4-player chess web game inspired by [Chess.com's Four Player Chess](https://www.chess.com/variants/four-player-chess).

## Features

- **Cross-shaped 14×14 board** with 4 players (Red, Blue, Yellow, Green)
- **Team play**: Red + Yellow vs Blue + Green
- **Real-time multiplayer** via WebSockets (Socket.io)
- **Full chess rules**: all piece types, check/checkmate, pawn promotion
- **Room-based lobby**: create or join with a room code

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **Game logic**: server-authoritative move validation

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Development

Run both server and client:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

### Production

```bash
npm run build
npm start
```

Serves the built client from the Express server on port 3001.

## How to Play

1. Open the app in your browser
2. Enter your name and **Create Room**
3. Share the room code with 3 friends (or open 4 browser tabs)
4. When all 4 slots are filled, click **Start Game**
5. Click your pieces and move to highlighted squares on your turn
6. Capture both enemy kings (Blue + Green or Red + Yellow) to win!

## Project Structure

```
four-player-chess/
├── client/          # React frontend
│   └── src/
│       ├── App.jsx
│       └── components/
├── server/          # Express + Socket.io backend
│   ├── index.js
│   └── game/
│       ├── board.js   # Board setup & utilities
│       ├── moves.js   # Move validation & game rules
│       └── room.js    # Room & game state management
└── package.json
```

