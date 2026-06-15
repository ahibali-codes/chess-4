import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRoom, getRoom, listRooms, findGameBySocket } from './game/room.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/rooms', (_req, res) => {
  res.json(listRooms());
});

app.post('/api/rooms', (_req, res) => {
  const game = createRoom();
  res.json({ roomId: game.roomId });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built. Run npm run dev for development.' });
  });
});

function broadcastGameState(room) {
  room.players.forEach((p, slot) => {
    if (p) {
      io.to(p.socketId).emit('gameState', room.getState(slot));
    }
  });
}

io.on('connection', (socket) => {
  socket.on('createRoom', (data, cb) => {
    const game = createRoom();
    const slot = game.addPlayer(socket.id, data?.name || 'Player');
    socket.join(game.roomId);
    cb?.({ roomId: game.roomId, slot });
    broadcastGameState(game);
  });

  socket.on('joinRoom', (data, cb) => {
    const { roomId, name, slot: preferredSlot } = data;
    const game = getRoom(roomId);
    if (!game) return cb?.({ error: 'Room not found' });
    if (game.getPlayerCount() >= 4) return cb?.({ error: 'Room is full' });

    const slot = game.addPlayer(socket.id, name || 'Player', preferredSlot);
    if (slot === null) return cb?.({ error: 'Could not join room' });

    socket.join(game.roomId);
    cb?.({ roomId: game.roomId, slot });
    io.to(game.roomId).emit('playerJoined', game.getState());
    broadcastGameState(game);
  });

  socket.on('startGame', (cb) => {
    const game = findGameBySocket(socket.id);
    if (!game) return cb?.({ error: 'Not in a room' });
    if (!game.canStart()) return cb?.({ error: 'Need 4 players to start' });

    game.start();
    io.to(game.roomId).emit('gameStarted');
    broadcastGameState(game);
    cb?.({ success: true });
  });

  socket.on('makeMove', (data, cb) => {
    const game = findGameBySocket(socket.id);
    if (!game) return cb?.({ error: 'Not in a room' });

    const result = game.tryMove(socket.id, data.from, data.to, data.promotion);
    if (result.error) return cb?.(result);

    io.to(game.roomId).emit('moveMade', game.lastMove);
    broadcastGameState(game);
    cb?.({ success: true });
  });

  socket.on('getMoves', (data, cb) => {
    const game = findGameBySocket(socket.id);
    if (!game) return cb?.([]);
    const moves = game.getMovesForSquare(socket.id, data.row, data.col);
    cb?.(moves);
  });

  socket.on('disconnect', () => {
    const game = findGameBySocket(socket.id);
    if (game) {
      game.removePlayer(socket.id);
      io.to(game.roomId).emit('playerLeft', game.getState());
      broadcastGameState(game);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
