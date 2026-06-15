import { v4 as uuidv4 } from 'uuid';
import { createInitialBoard, PLAYERS, isEliminated } from './board.js';
import {
  makeMove,
  getLegalMoves,
  getLegalMovesFrom,
  isInCheck,
  isCheckmate,
  nextActivePlayer,
  checkWin,
} from './moves.js';

export class Game {
  constructor(roomId) {
    this.roomId = roomId;
    this.board = createInitialBoard();
    this.currentPlayer = 0;
    this.status = 'waiting';
    this.players = [null, null, null, null];
    this.winner = null;
    this.lastMove = null;
    this.moveHistory = [];
  }

  addPlayer(socketId, name, preferredSlot = null) {
    const slot =
      preferredSlot !== null && this.players[preferredSlot] === null
        ? preferredSlot
        : this.players.findIndex((p) => p === null);

    if (slot === -1) return null;

    this.players[slot] = { socketId, name, slot };
    return slot;
  }

  removePlayer(socketId) {
    const idx = this.players.findIndex((p) => p && p.socketId === socketId);
    if (idx !== -1) {
      this.players[idx] = null;
      if (this.status === 'playing') {
        this.status = 'waiting';
      }
    }
    return idx;
  }

  getPlayerCount() {
    return this.players.filter((p) => p !== null).length;
  }

  canStart() {
    return this.getPlayerCount() === 4 && this.status === 'waiting';
  }

  start() {
    if (!this.canStart()) return false;
    this.status = 'playing';
    this.board = createInitialBoard();
    this.currentPlayer = 0;
    this.winner = null;
    this.lastMove = null;
    this.moveHistory = [];
    return true;
  }

  getState(forPlayer = null) {
    return {
      roomId: this.roomId,
      board: this.board,
      currentPlayer: this.currentPlayer,
      status: this.status,
      players: this.players.map((p, i) =>
        p
          ? { name: p.name, slot: i, color: PLAYERS[i].name, team: PLAYERS[i].team }
          : null
      ),
      winner: this.winner,
      lastMove: this.lastMove,
      inCheck: isInCheck(this.board, this.currentPlayer),
      yourSlot: forPlayer,
      legalMoves:
        forPlayer !== null && forPlayer === this.currentPlayer
          ? getLegalMoves(this.board, forPlayer)
          : [],
    };
  }

  tryMove(socketId, from, to, promotion = 'Q') {
    if (this.status !== 'playing') return { error: 'Game not in progress' };

    const player = this.players.findIndex((p) => p && p.socketId === socketId);
    if (player === -1) return { error: 'Not in game' };
    if (player !== this.currentPlayer) return { error: 'Not your turn' };
    if (isEliminated(this.board, player)) return { error: 'You are eliminated' };

    try {
      const move = { from, to, promotion };
      this.board = makeMove(this.board, move);
      this.lastMove = { from, to, player };
      this.moveHistory.push({ from, to, player });

      if (isCheckmate(this.board, player)) {
        // self-checkmate shouldn't happen with legal moves
      }

      for (let p = 0; p < 4; p++) {
        if (p !== player && !isEliminated(this.board, p) && isCheckmate(this.board, p)) {
          // opponent checkmated - king capture handles elimination in 4pc
        }
      }

      const win = checkWin(this.board);
      if (win) {
        this.status = 'finished';
        this.winner = win;
      } else {
        this.currentPlayer = nextActivePlayer(this.board, this.currentPlayer);
      }

      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  }

  getMovesForSquare(socketId, row, col) {
    const player = this.players.findIndex((p) => p && p.socketId === socketId);
    if (player === -1) return [];
    if (player !== this.currentPlayer) return [];
    return getLegalMovesFrom(this.board, row, col);
  }
}

const rooms = new Map();

export function createRoom() {
  const id = uuidv4().slice(0, 8).toUpperCase();
  const game = new Game(id);
  rooms.set(id, game);
  return game;
}

export function getRoom(id) {
  return rooms.get(id.toUpperCase());
}

export function deleteRoom(id) {
  rooms.delete(id.toUpperCase());
}

export function listRooms() {
  return Array.from(rooms.values()).map((g) => ({
    id: g.roomId,
    players: g.getPlayerCount(),
    status: g.status,
  }));
}

export function findGameBySocket(socketId) {
  for (const game of rooms.values()) {
    if (game.players.some((p) => p && p.socketId === socketId)) return game;
  }
  return null;
}
