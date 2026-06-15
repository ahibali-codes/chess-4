const PLAYER_COLORS = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71'];
const PLAYER_NAMES = ['Red', 'Blue', 'Yellow', 'Green'];
const TEAM_NAMES = ['Red & Yellow', 'Blue & Green'];

export default function Lobby({ playerName, setPlayerName, roomId, setRoomId, onCreate, onJoin, gameState, onStart, mySlot }) {
  const players = gameState?.players || [null, null, null, null];
  const playerCount = players.filter(Boolean).length;

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h2>Play Four Player Chess</h2>
        <p className="subtitle">
          Teams: Red + Yellow vs Blue + Green. Capture both enemy kings to win!
        </p>

        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="lobby-actions">
          <button className="btn btn-primary" onClick={onCreate}>
            Create Room
          </button>
          <div className="join-row">
            <input
              type="text"
              placeholder="Room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button className="btn btn-secondary" onClick={onJoin}>
              Join
            </button>
          </div>
        </div>
      </div>

      {gameState && (
        <div className="lobby-card room-status">
          <h3>Room: {gameState.roomId}</h3>
          <div className="player-slots">
            {players.map((p, i) => (
              <div
                key={i}
                className={`player-slot ${p ? 'filled' : 'empty'} ${mySlot === i ? 'you' : ''}`}
                style={{ borderColor: PLAYER_COLORS[i] }}
              >
                <span className="slot-color" style={{ background: PLAYER_COLORS[i] }} />
                <span className="slot-name">{PLAYER_NAMES[i]}</span>
                <span className="slot-player">{p ? p.name : 'Waiting...'}</span>
                {mySlot === i && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
          <p className="player-count">{playerCount} / 4 players</p>
          {playerCount === 4 && mySlot !== null && (
            <button className="btn btn-primary btn-start" onClick={onStart}>
              Start Game
            </button>
          )}
        </div>
      )}

      <div className="lobby-card rules">
        <h3>How to Play</h3>
        <ul>
          <li>4 players on a cross-shaped 14×14 board</li>
          <li>Turns go clockwise: Red → Blue → Yellow → Green</li>
          <li>Red & Yellow are teammates; Blue & Green are teammates</li>
          <li>Standard chess piece movement from your side</li>
          <li>Capture both enemy kings to win the game</li>
        </ul>
      </div>
    </div>
  );
}
