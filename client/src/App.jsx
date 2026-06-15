import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Board from './components/Board';
import GameInfo from './components/GameInfo';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mySlot, setMySlot] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('gameState', (state) => {
      setGameState(state);
      if (state.yourSlot !== null && state.yourSlot !== undefined) {
        setMySlot(state.yourSlot);
      }
    });
    s.on('playerJoined', (state) => setGameState(state));
    s.on('playerLeft', (state) => setGameState(state));
    s.on('gameStarted', () => setSelected(null));
    s.on('moveMade', () => setSelected(null));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const createRoom = useCallback(() => {
    if (!socket || !playerName.trim()) {
      setError('Enter your name first');
      return;
    }
    setError('');
    socket.emit('createRoom', { name: playerName.trim() }, (res) => {
      if (res?.error) setError(res.error);
      else {
        setRoomId(res.roomId);
        setMySlot(res.slot);
      }
    });
  }, [socket, playerName]);

  const joinRoom = useCallback(() => {
    if (!socket || !playerName.trim() || !roomId.trim()) {
      setError('Enter your name and room code');
      return;
    }
    setError('');
    socket.emit('joinRoom', { roomId: roomId.trim().toUpperCase(), name: playerName.trim() }, (res) => {
      if (res?.error) setError(res.error);
      else {
        setRoomId(res.roomId);
        setMySlot(res.slot);
      }
    });
  }, [socket, playerName, roomId]);

  const startGame = useCallback(() => {
    socket?.emit('startGame', (res) => {
      if (res?.error) setError(res.error);
    });
  }, [socket]);

  const handleSquareClick = useCallback(
    (row, col) => {
      if (!gameState || gameState.status !== 'playing') return;
      if (mySlot !== gameState.currentPlayer) return;

      const piece = gameState.board[row][col];
      const isMyPiece = piece && piece.player === mySlot;

      if (selected) {
        const [sr, sc] = selected;
        const isLegal = gameState.legalMoves?.some(
          (m) => m.from[0] === sr && m.from[1] === sc && m.to[0] === row && m.to[1] === col
        );
        if (isLegal) {
          socket.emit('makeMove', { from: [sr, sc], to: [row, col] }, (res) => {
            if (res?.error) setError(res.error);
            else setError('');
          });
          setSelected(null);
          return;
        }
        if (isMyPiece) {
          setSelected([row, col]);
          return;
        }
        setSelected(null);
        return;
      }

      if (isMyPiece) setSelected([row, col]);
    },
    [gameState, mySlot, selected, socket]
  );

  const inLobby = !gameState || gameState.status === 'waiting';

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">♔</span>
          <h1>Four Player Chess</h1>
        </div>
        <div className={`status-dot ${connected ? 'online' : 'offline'}`} title={connected ? 'Connected' : 'Disconnected'} />
      </header>

      {error && <div className="error-banner">{error}</div>}

      {inLobby ? (
        <Lobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomId={roomId}
          setRoomId={setRoomId}
          onCreate={createRoom}
          onJoin={joinRoom}
          gameState={gameState}
          onStart={startGame}
          mySlot={mySlot}
        />
      ) : (
        <div className="game-layout">
          <GameInfo gameState={gameState} mySlot={mySlot} roomId={roomId} />
          <Board
            board={gameState.board}
            selected={selected}
            legalMoves={gameState.legalMoves || []}
            lastMove={gameState.lastMove}
            mySlot={mySlot}
            currentPlayer={gameState.currentPlayer}
            onSquareClick={handleSquareClick}
          />
        </div>
      )}
    </div>
  );
}
