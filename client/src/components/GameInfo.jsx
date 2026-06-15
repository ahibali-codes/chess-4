const PLAYER_NAMES = ['Red', 'Blue', 'Yellow', 'Green'];
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71'];
const TEAM_NAMES = ['Red & Yellow', 'Blue & Green'];

export default function GameInfo({ gameState, mySlot, roomId }) {
  if (!gameState) return null;

  const current = gameState.currentPlayer;
  const isMyTurn = mySlot === current;

  return (
    <aside className="game-info">
      <div className="info-card">
        <h3>Room {roomId || gameState.roomId}</h3>
        {mySlot !== null && (
          <p className="your-color" style={{ color: PLAYER_COLORS[mySlot] }}>
            You are {PLAYER_NAMES[mySlot]} (Team: {TEAM_NAMES[mySlot % 2 === 0 ? 0 : 1]})
          </p>
        )}
      </div>

      <div className="info-card turn-card">
        <h4>Current Turn</h4>
        <p className="turn-player" style={{ color: PLAYER_COLORS[current] }}>
          {PLAYER_NAMES[current]}
          {isMyTurn && <span className="your-turn"> — Your turn!</span>}
        </p>
        {gameState.inCheck && <p className="check-warning">Check!</p>}
      </div>

      <div className="info-card">
        <h4>Players</h4>
        <ul className="player-list">
          {gameState.players.map((p, i) =>
            p ? (
              <li key={i} style={{ color: PLAYER_COLORS[i] }}>
                {PLAYER_NAMES[i]}: {p.name}
                {mySlot === i && ' (you)'}
              </li>
            ) : null
          )}
        </ul>
      </div>

      {gameState.status === 'finished' && gameState.winner && (
        <div className="info-card winner-card">
          <h4>Game Over!</h4>
          <p>Team {TEAM_NAMES[gameState.winner.team]} wins!</p>
        </div>
      )}
    </aside>
  );
}
