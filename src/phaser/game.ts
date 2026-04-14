import * as Phaser from 'phaser';

/**
 * Phaser game configuration
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 1024,
      height: 600
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
       gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [], // Start with no scenes - will add dynamically
  render: {
    pixelArt: false,
    antialias: true
  }
};

/**
 * Create and return a new Phaser game instance
 */
export function createGame(): Phaser.Game {
  return new Phaser.Game(gameConfig);
}

/**
 * Destroy the game instance
 */
export function destroyGame(game: Phaser.Game | null): void {
  if (game) {
    game.destroy(true);
  }
}
