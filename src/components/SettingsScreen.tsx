import React, { useState, useEffect } from 'react';
import { useRaceStore } from '../store/raceStore';
import { RaceCalculator } from '../core/RaceCalculator';
// import { audioDB } from '../dexie/audioDB';

interface SettingsScreenProps {
  onStartRace: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onStartRace }) => {
  const {
    players,
    raceMode,
    raceDuration,
    audioFiles,
    isCalculating,
    addPlayer,
    removePlayer,
    updatePlayer,
    setRaceMode,
    setRaceDuration,
    uploadAudio,
    deleteAudio,
    loadAudioFromDB,
    setRaceData,
    setIsCalculating,
    resetAll
  } = useRaceStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerVotes, setNewPlayerVotes] = useState(1);

  // Load saved audio on mount
  useEffect(() => {
    loadAudioFromDB();
  }, []);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim(), newPlayerVotes);
      setNewPlayerName('');
      setNewPlayerVotes(1);
    }
  };

  const handleAudioUpload = async (type: 'countdown' | 'racing' | 'finish', file: File) => {
    try {
      await uploadAudio(type, file);
    } catch (error) {
      alert('Failed to upload audio file');
    }
  };

  const handleStartRace = async () => {
    if (players.length < 2) {
      alert('Please add at least 2 players');
      return;
    }

    setIsCalculating(true);

    // Calculate race data
    const calculator = new RaceCalculator();
    const raceData = calculator.calculateRace(
      players,
      raceMode,
      raceDuration,
      1200, // screenWidth
      800   // screenHeight
    );

    setRaceData(raceData);
    setIsCalculating(false);

    // Start the race
    onStartRace();
  };

  return (
    <div className="settings-screen">
      <h1>🦆 Duck Racing Settings 🦆</h1>

      {/* Race Mode Toggle */}
      <div className="setting-section">
        <h3>Race Mode</h3>
        <div className="mode-toggle">
          <button
            className={raceMode === 'fixed' ? 'active' : ''}
            onClick={() => setRaceMode('fixed')}
          >
            Fixed Result (by Votes)
          </button>
          <button
            className={raceMode === 'random' ? 'active' : ''}
            onClick={() => setRaceMode('random')}
          >
            Random Result
          </button>
        </div>
        <p className="hint">
          {raceMode === 'fixed'
            ? 'Results determined by vote count (highest votes wins)'
            : 'Results randomized for each race'}
        </p>
      </div>

      {/* Race Duration */}
      <div className="setting-section">
        <h3>Race Duration</h3>
        <input
          type="range"
          min="10"
          max="120"
          value={raceDuration}
          onChange={(e) => setRaceDuration(parseInt(e.target.value))}
        />
        <span className="duration-display">{raceDuration} seconds</span>
      </div>

      {/* Players List */}
      <div className="setting-section">
        <h3>Players ({players.length})</h3>
        <div className="players-list">
          {players.map((player) => (
            <div key={player.id} className="player-row">
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                placeholder="Player name"
              />
              <input
                type="number"
                min="0"
                value={player.votes}
                onChange={(e) => updatePlayer(player.id, { votes: Number(e.target.value) })}
                placeholder="Votes"
                disabled={raceMode === 'random'}
                title={raceMode === 'random' ? 'Votes are only used in Fixed Result mode' : ''}
                style={{ 
                  opacity: raceMode === 'random' ? 0.5 : 1,
                  cursor: raceMode === 'random' ? 'not-allowed' : 'text'
                }}
              />
              <button
                className="remove-btn"
                onClick={() => removePlayer(player.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Player */}
        <div className="add-player-row">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="New player name"
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
          />
          <input
            type="number"
            min="0"
            value={newPlayerVotes}
            onChange={(e) => setNewPlayerVotes(Number(e.target.value))}
            placeholder="Votes"
            disabled={raceMode === 'random'}
            title={raceMode === 'random' ? 'Votes are only used in Fixed Result mode' : ''}
            style={{ 
              opacity: raceMode === 'random' ? 0.5 : 1,
              cursor: raceMode === 'random' ? 'not-allowed' : 'text'
            }}
          />
          <button onClick={handleAddPlayer}>+ Add</button>
        </div>
      </div>

      {/* Audio Uploads */}
      <div className="setting-section">
        <h3>Custom Audio (Optional)</h3>
        
        <div className="audio-uploads">
          <div className="audio-row">
            <label>Countdown Music:</label>
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg,audio/x-wav,.mp3,.wav,.ogg,.m4a,.aac,.mp4"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload('countdown', e.target.files[0])}
            />
            {audioFiles.countdown && (
              <button onClick={() => deleteAudio('countdown')}>Remove</button>
            )}
          </div>

          <div className="audio-row">
            <label>Racing Music:</label>
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg,audio/x-wav,.mp3,.wav,.ogg,.m4a,.aac,.mp4"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload('racing', e.target.files[0])}
            />
            {audioFiles.racing && (
              <button onClick={() => deleteAudio('racing')}>Remove</button>
            )}
          </div>

          <div className="audio-row">
            <label>Finish Music:</label>
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg,audio/x-wav,.mp3,.wav,.ogg,.m4a,.aac,.mp4"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload('finish', e.target.files[0])}
            />
            {audioFiles.finish && (
              <button onClick={() => deleteAudio('finish')}>Remove</button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="start-btn"
          onClick={handleStartRace}
          disabled={isCalculating || players.length < 2}
        >
          {isCalculating ? 'Calculating...' : '🏁 START RACE 🏁'}
        </button>

        <button className="reset-btn" onClick={resetAll}>
          Reset All
        </button>
      </div>
    </div>
  );
};
