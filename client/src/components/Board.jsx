const PLAYER_COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71'];
const PLAYER_NAMES = ['Red', 'Blue', 'Yellow', 'Green'];

const PIECE_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
};

function isActiveSquare(r, c) {
  if (r >= 3 && r <= 10 && c >= 3 && c <= 10) return true;
  if (r <= 2 && c >= 3 && c <= 10) return true;
  if (r >= 11 && c >= 3 && c <= 10) return true;
  if (c >= 11 && r >= 3 && r <= 10) return true;
  if (c <= 2 && r >= 3 && r <= 10) return true;
  return false;
}

export default function Board({ board, selected, legalMoves, lastMove, mySlot, currentPlayer, onSquareClick }) {
  const selectedMoves = selected
    ? legalMoves.filter((m) => m.from[0] === selected[0] && m.from[1] === selected[1])
    : [];

  const isHighlight = (r, c) => {
    if (selected && selected[0] === r && selected[1] === c) return 'selected';
    if (selectedMoves.some((m) => m.to[0] === r && m.to[1] === c)) return 'legal';
    if (lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c)))
      return 'last-move';
    return '';
  };

  const getRotation = () => {
    if (mySlot === null) return 0;
    return [0, 90, 180, 270][mySlot];
  };

  const rows = [];
  for (let r = 0; r < 14; r++) {
    const cells = [];
    for (let c = 0; c < 14; c++) {
      if (!isActiveSquare(r, c)) {
        cells.push(<div key={`${r}-${c}`} className="cell inactive" />);
        continue;
      }

      const piece = board[r][c];
      const light = (r + c) % 2 === 0;
      const highlight = isHighlight(r, c);
      const isMyTurn = mySlot === currentPlayer;

      cells.push(
        <div
          key={`${r}-${c}`}
          className={`cell active ${light ? 'light' : 'dark'} ${highlight} ${isMyTurn ? 'clickable' : ''}`}
          onClick={() => onSquareClick(r, c)}
        >
          {piece && (
            <span
              className="piece"
              style={{ color: PLAYER_COLORS[piece.player] }}
            >
              {PIECE_UNICODE[piece.type]}
            </span>
          )}
          {highlight === 'legal' && !piece && <span className="move-dot" />}
        </div>
      );
    }
    rows.push(
      <div key={r} className="board-row">
        {cells}
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-labels">
        <span className="label label-top" style={{ color: PLAYER_COLORS[2] }}>Yellow</span>
        <span className="label label-bottom" style={{ color: PLAYER_COLORS[0] }}>Red</span>
        <span className="label label-left" style={{ color: PLAYER_COLORS[3] }}>Green</span>
        <span className="label label-right" style={{ color: PLAYER_COLORS[1] }}>Blue</span>
      </div>
      <div className="board" style={{ transform: `rotate(${getRotation()}deg)` }}>
        {rows}
      </div>
    </div>
  );
}
