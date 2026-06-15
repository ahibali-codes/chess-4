export const BOARD_SIZE = 14;

export const PLAYERS = [
  { id: 0, name: 'Red', color: '#e74c3c', team: 0 },
  { id: 1, name: 'Blue', color: '#3498db', team: 1 },
  { id: 2, name: 'Yellow', color: '#f1c40f', team: 0 },
  { id: 3, name: 'Green', color: '#2ecc71', team: 1 },
];

export const PLAYER_DIRS = {
  0: { forward: [-1, 0], right: [0, 1], back: [1, 0], left: [0, -1] },
  1: { forward: [0, -1], right: [-1, 0], back: [0, 1], left: [1, 0] },
  2: { forward: [1, 0], right: [0, -1], back: [-1, 0], left: [0, 1] },
  3: { forward: [0, 1], right: [1, 0], back: [0, -1], left: [-1, 0] },
};

export const PAWN_START = { 0: 11, 1: 11, 2: 2, 3: 2 };
export const PAWN_PROMOTE = { 0: 3, 1: 3, 2: 10, 3: 10 };

export function isActiveSquare(r, c) {
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
  if (r >= 3 && r <= 10 && c >= 3 && c <= 10) return true;
  if (r <= 2 && c >= 3 && c <= 10) return true;
  if (r >= 11 && c >= 3 && c <= 10) return true;
  if (c >= 11 && r >= 3 && r <= 10) return true;
  if (c <= 2 && r >= 3 && r <= 10) return true;
  return false;
}

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

function placePiece(board, r, c, type, player) {
  board[r][c] = { type, player, hasMoved: false };
}

export function createInitialBoard() {
  const board = createEmptyBoard();

  const southBack = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let i = 0; i < 8; i++) {
    placePiece(board, 12, 3 + i, southBack[i], 0);
    placePiece(board, 11, 3 + i, 'P', 0);
  }

  const northBack = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let i = 0; i < 8; i++) {
    placePiece(board, 1, 10 - i, northBack[i], 2);
    placePiece(board, 2, 10 - i, 'P', 2);
  }

  const eastBack = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let i = 0; i < 8; i++) {
    placePiece(board, 3 + i, 12, eastBack[i], 1);
    placePiece(board, 3 + i, 11, 'P', 1);
  }

  const westBack = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let i = 0; i < 8; i++) {
    placePiece(board, 10 - i, 1, westBack[i], 3);
    placePiece(board, 10 - i, 2, 'P', 3);
  }

  return board;
}

export function cloneBoard(board) {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

export function getKingPosition(board, player) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player && piece.type === 'K') {
        return [r, c];
      }
    }
  }
  return null;
}

export function isEliminated(board, player) {
  return getKingPosition(board, player) === null;
}

export function getTeam(playerId) {
  return PLAYERS[playerId].team;
}

export function areTeammates(p1, p2) {
  return getTeam(p1) === getTeam(p2);
}
