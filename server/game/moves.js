import {
  BOARD_SIZE,
  PLAYER_DIRS,
  PAWN_START,
  PAWN_PROMOTE,
  isActiveSquare,
  cloneBoard,
  getKingPosition,
  isEliminated,
  areTeammates,
} from './board.js';

function addVec(r, c, [dr, dc]) {
  return [r + dr, c + dc];
}

function getDiagonals(dirs) {
  const { forward: f, back: b, left: l, right: r } = dirs;
  return [
    [f[0] + l[0], f[1] + l[1]],
    [f[0] + r[0], f[1] + r[1]],
    [b[0] + l[0], b[1] + l[1]],
    [b[0] + r[0], b[1] + r[1]],
  ];
}

function getOrthogonals(dirs) {
  const { forward, back, left, right } = dirs;
  return [forward, back, left, right];
}

function getAllDirections(dirs) {
  return [...getOrthogonals(dirs), ...getDiagonals(dirs)];
}

function inBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function getPiece(board, r, c) {
  if (!inBounds(r, c) || !isActiveSquare(r, c)) return null;
  return board[r][c];
}

function isEnemy(piece, player) {
  return piece && piece.player !== player && !areTeammates(piece.player, player);
}

function isAlly(piece, player) {
  return piece && areTeammates(piece.player, player);
}

function slideMoves(board, r, c, player, directions) {
  const moves = [];
  for (const dir of directions) {
    let [nr, nc] = addVec(r, c, dir);
    while (inBounds(nr, nc) && isActiveSquare(nr, nc)) {
      const target = board[nr][nc];
      if (!target) {
        moves.push({ from: [r, c], to: [nr, nc] });
      } else {
        if (isEnemy(target, player)) {
          moves.push({ from: [r, c], to: [nr, nc] });
        }
        break;
      }
      [nr, nc] = addVec(nr, nc, dir);
    }
  }
  return moves;
}

function kingMoves(board, r, c, player) {
  const dirs = PLAYER_DIRS[player];
  const moves = [];
  for (const dir of getAllDirections(dirs)) {
    const [nr, nc] = addVec(r, c, dir);
    const target = getPiece(board, nr, nc);
    if (target && isAlly(target, player)) continue;
    if (inBounds(nr, nc) && isActiveSquare(nr, nc)) {
      moves.push({ from: [r, c], to: [nr, nc] });
    }
  }
  return moves;
}

function knightMoves(board, r, c, player) {
  const dirs = PLAYER_DIRS[player];
  const { forward: f, back: b, left: l, right: rgt } = dirs;
  const offsets = [
    [2 * f[0] + l[0], 2 * f[1] + l[1]],
    [2 * f[0] + rgt[0], 2 * f[1] + rgt[1]],
    [2 * b[0] + l[0], 2 * b[1] + l[1]],
    [2 * b[0] + rgt[0], 2 * b[1] + rgt[1]],
    [f[0] + 2 * l[0], f[1] + 2 * l[1]],
    [f[0] + 2 * rgt[0], f[1] + 2 * rgt[1]],
    [b[0] + 2 * l[0], b[1] + 2 * l[1]],
    [b[0] + 2 * rgt[0], b[1] + 2 * rgt[1]],
  ];
  const moves = [];
  for (const off of offsets) {
    const [nr, nc] = addVec(r, c, off);
    const target = getPiece(board, nr, nc);
    if (target && isAlly(target, player)) continue;
    if (inBounds(nr, nc) && isActiveSquare(nr, nc)) {
      moves.push({ from: [r, c], to: [nr, nc] });
    }
  }
  return moves;
}

function pawnMoves(board, row, col, player, piece) {
  const dirs = PLAYER_DIRS[player];
  const { forward: f, left: l, right: rt } = dirs;
  const moves = [];
  const isHorizontal = player === 1 || player === 3;
  const pos = isHorizontal ? col : row;
  const start = PAWN_START[player];
  const promote = PAWN_PROMOTE[player];

  const [fr, fc] = addVec(row, col, f);
  if (getPiece(board, fr, fc) === null) {
    const reachingPromote =
      (isHorizontal && fc === promote) || (!isHorizontal && fr === promote);
    moves.push({
      from: [row, col],
      to: [fr, fc],
      promotion: reachingPromote ? 'Q' : undefined,
    });

    if (!piece.hasMoved && pos === start) {
      const [fr2, fc2] = addVec(fr, fc, f);
      if (getPiece(board, fr2, fc2) === null) {
        moves.push({ from: [row, col], to: [fr2, fc2] });
      }
    }
  }

  for (const capDir of [
    [f[0] + l[0], f[1] + l[1]],
    [f[0] + rt[0], f[1] + rt[1]],
  ]) {
    const [cr, cc] = addVec(row, col, capDir);
    const target = getPiece(board, cr, cc);
    if (target && isEnemy(target, player)) {
      const reachingPromote =
        (isHorizontal && cc === promote) || (!isHorizontal && cr === promote);
      moves.push({
        from: [row, col],
        to: [cr, cc],
        promotion: reachingPromote ? 'Q' : undefined,
      });
    }
  }

  return moves;
}

export function getRawMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const { type, player } = piece;
  const dirs = PLAYER_DIRS[player];

  switch (type) {
    case 'K':
      return kingMoves(board, r, c, player);
    case 'Q':
      return [
        ...slideMoves(board, r, c, player, getOrthogonals(dirs)),
        ...slideMoves(board, r, c, player, getDiagonals(dirs)),
      ];
    case 'R':
      return slideMoves(board, r, c, player, getOrthogonals(dirs));
    case 'B':
      return slideMoves(board, r, c, player, getDiagonals(dirs));
    case 'N':
      return knightMoves(board, r, c, player);
    case 'P':
      return pawnMoves(board, r, c, player, piece);
    default:
      return [];
  }
}

function findAllMoves(board, player) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        moves.push(...getRawMoves(board, r, c));
      }
    }
  }
  return moves;
}

function isSquareAttacked(board, r, c, byPlayer) {
  for (let sr = 0; sr < BOARD_SIZE; sr++) {
    for (let sc = 0; sc < BOARD_SIZE; sc++) {
      const piece = board[sr][sc];
      if (!piece || piece.player !== byPlayer) continue;
      const moves = getRawMoves(board, sr, sc);
      if (moves.some((m) => m.to[0] === r && m.to[1] === c)) return true;
    }
  }
  return false;
}

export function isInCheck(board, player) {
  if (isEliminated(board, player)) return false;
  const kingPos = getKingPosition(board, player);
  if (!kingPos) return false;
  const [kr, kc] = kingPos;

  for (let p = 0; p < 4; p++) {
    if (p === player || areTeammates(p, player) || isEliminated(board, p))
      continue;
    if (isSquareAttacked(board, kr, kc, p)) return true;
  }
  return false;
}

function applyMove(board, move) {
  const newBoard = cloneBoard(board);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = { ...newBoard[fr][fc], hasMoved: true };
  newBoard[fr][fc] = null;
  if (move.promotion) {
    piece.type = move.promotion;
  }
  newBoard[tr][tc] = piece;
  return newBoard;
}

export function getLegalMoves(board, player) {
  if (isEliminated(board, player)) return [];
  const raw = findAllMoves(board, player);
  return raw.filter((move) => {
    const next = applyMove(board, move);
    return !isInCheck(next, player);
  });
}

export function getLegalMovesFrom(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  return getLegalMoves(board, piece.player).filter(
    (m) => m.from[0] === r && m.from[1] === c
  );
}

export function makeMove(board, move) {
  const piece = board[move.from[0]][move.from[1]];
  if (!piece) throw new Error('No piece at source');
  const legal = getLegalMoves(board, piece.player);
  const match = legal.find(
    (m) =>
      m.from[0] === move.from[0] &&
      m.from[1] === move.from[1] &&
      m.to[0] === move.to[0] &&
      m.to[1] === move.to[1]
  );
  if (!match) throw new Error('Illegal move');

  const newBoard = applyMove(board, {
    ...match,
    promotion: move.promotion || match.promotion,
  });
  return newBoard;
}

export function hasLegalMoves(board, player) {
  return getLegalMoves(board, player).length > 0;
}

export function isCheckmate(board, player) {
  return isInCheck(board, player) && !hasLegalMoves(board, player);
}

export function nextActivePlayer(board, current) {
  for (let i = 1; i <= 4; i++) {
    const next = (current + i) % 4;
    if (!isEliminated(board, next)) return next;
  }
  return current;
}

export function checkWin(board) {
  const team0Alive = [0, 2].some((p) => !isEliminated(board, p));
  const team1Alive = [1, 3].some((p) => !isEliminated(board, p));

  if (team0Alive && !team1Alive) return { team: 0, players: [0, 2] };
  if (team1Alive && !team0Alive) return { team: 1, players: [1, 3] };
  return null;
}
