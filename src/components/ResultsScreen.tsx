import React, { useMemo } from 'react';
import { useRaceStore } from '../store/raceStore';

interface ResultsScreenProps {
  onBackToSettings: () => void;
}

const Confetti: React.FC = () => {
  const particles = useMemo(() => {
    const emojis = ['🎉', '✨', '🎊', '🎈', '🌟', '🎆', '💫', '🔥', '⭐', '🎁'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 16 + Math.random() * 24
    }));
  }, []);

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

const Firework: React.FC<{ delay: number; left: number }> = ({ delay, left }) => {
  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    return { angle, color: ['#FF0000', '#FFD700', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500'][i % 6] };
  }), []);

  return (
    <div className="firework" style={{ left: `${left}%`, animationDelay: `${delay}s` }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="firework-particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--color': p.color,
            animationDelay: `${i * 30}ms`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ onBackToSettings }) => {
  const { currentResults } = useRaceStore();

  if (!currentResults || currentResults.length === 0) {
    return null;
  }

  const getRankEmoji = (rank: number) => {
    const emojis: { [key: number]: string } = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
      4: '4️⃣',
      5: '5️⃣'
    };
    return emojis[rank] || `${rank}️⃣`;
  };

  const winners = currentResults.filter(r => r.finishOrder === 1);
  const winnerText = winners.length === 1
    ? `🏆 ${winners[0].playerName} 🏆`
    : `🏆 ${winners.map(w => w.playerName).join(' & ')} 🏆`;

  return (
    <div className="results-screen">
      <Confetti />

      <div className="fireworks-container">
        <Firework delay={0} left={20} />
        <Firework delay={0.5} left={80} />
        <Firework delay={1} left={50} />
        <Firework delay={1.5} left={30} />
        <Firework delay={2} left={70} />
        <Firework delay={2.5} left={40} />
      </div>

      <h1 className="results-title">
        <span className="title-star">⭐</span>
        CONGRATULATIONS!
        <span className="title-star">⭐</span>
      </h1>

      <div className="winner-announcement">
        <div className="winner-sparkles">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="sparkle" style={{ '--i': i } as React.CSSProperties}>✨</span>
          ))}
        </div>
        <div className="winner-text">{winnerText}</div>
        <div className="winner-subtitle">WINNER{winners.length > 1 ? 'S' : ''}</div>
      </div>

      <div className="results-section">
        <h3>🏁 Race Results ({currentResults.length} players) 🏁</h3>
        <div className="results-list">
          {currentResults.map((result, index) => {
            const isWinner = result.finishOrder === 1;
            return (
              <div
                key={result.playerId}
                className={`result-row ${isWinner ? 'winner' : ''}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <span className="rank">{getRankEmoji(result.finishOrder)}</span>
                <span className="name">{result.playerName}</span>
                {result.votes > 0 && (
                  <span className="votes">🗳️ {result.votes}</span>
                )}
                {isWinner && <span className="winner-badge">👑 WINNER!</span>}
                {isWinner && result.isTie && (
                  <span className="tie-badge">(TIED)</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button className="back-btn" onClick={onBackToSettings}>
        🎮 Back to Settings
      </button>
    </div>
  );
};
