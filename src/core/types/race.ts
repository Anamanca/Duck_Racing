/**
 * Core TypeScript types for Duck Racing game
 */

// Player input data
export interface Player {
  id: string;
  name: string;
  votes: number;
}

// Finish result with continuous ranking
export interface FinishResult {
  playerId: string;
  playerName: string;
  votes: number;
  finishOrder: number;
  isTie: boolean;
  tieWith?: string[];
}

// Lane definition
export interface Lane {
  id: number;
  duckId: string;
  yPosition: number;
  width: number;
  startX: number;
  finishX: number;
  path: Path2D;
}

// Obstacle types
export type ObstacleType = 'rock' | 'log' | 'whirlpool' | 'branch' | 'duck-collision' | 'virtual-slowdown';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  position: {
    x: number;
    y: number;
  };
  affectsLaneIds: number[];
  width: number;
  speedMultiplier: number;
  effectDuration: number;
  isVirtual?: boolean;
}

// Speed boost
export interface Boost {
  type: string;
  startX: number;
  multiplier: number;
  duration: number;
  animation: string;
}

// Velocity timeline entry
export interface VelocityEntry {
  timestamp: number;
  targetX: number;
  velocity: number;
  event?: 'obstacle' | 'boost' | 'normal';
}

// Position correction point
export interface CorrectionPoint {
  xPosition: number;
  expectedRank: number;
  tolerance: number;
}

// Duck racing profile
export interface DuckProfile {
  playerId: string;
  playerName: string;
  votes: number;
  finishOrder: number;
  laneId: number;
  obstacles: Obstacle[];
  speedBoosts: Boost[];
  velocityTimeline: VelocityEntry[];
  actualPath: number[];
  baseVelocity: number;
  correctionPoint: CorrectionPoint;
  hasCorrected?: boolean;
}

// Race configuration
export interface RaceConfig {
  players: Player[];
  raceMode: 'fixed' | 'random';
  raceDuration: number;
  audioFiles: {
    countdown?: Blob;
    racing?: Blob;
    finish?: Blob;
  };
}

// Audio storage in Dexie
export interface AudioFile {
  id: string;
  type: 'countdown' | 'racing' | 'finish';
  blob: Blob;
  name: string;
  size: number;
  uploadedAt: Date;
}

// Game state
export type GameState = 'settings' | 'countdown' | 'racing' | 'finished';
