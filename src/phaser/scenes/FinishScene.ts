import * as Phaser from 'phaser';
import { useRaceStore } from '../../store/raceStore';
import type { FinishResult } from '../../core/types/race';

/**
 * Finish Scene - Brief celebration before showing React ResultsScreen
 */
export class FinishScene extends Phaser.Scene {
  private results: FinishResult[] = [];

  constructor() {
    super({ key: 'FinishScene' });
  }

  init() {
    const storeResults = useRaceStore.getState().currentResults;
    if (storeResults) {
      this.results = storeResults;
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    const titleText = this.add.text(width / 2, 60, '🎉 CONGRATULATIONS! 🎉', {
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const winners = this.results.filter(r => r.finishOrder === 1);
    if (winners.length > 0) {
      let winnerTextStr: string;
      if (winners.length === 1) {
        winnerTextStr = `🏆 ${winners[0].playerName} 🏆`;
      } else {
        const winnerNames = winners.map(w => w.playerName).join(' & ');
        winnerTextStr = `🏆 ${winnerNames} 🏆`;
      }

      const winnerText = this.add.text(width / 2, height / 2, winnerTextStr, {
        fontSize: winners.length > 1 ? '28px' : '32px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        stroke: '#FFD700',
        strokeThickness: 6
      }).setOrigin(0.5);

      this.tweens.add({
        targets: winnerText,
        scale: { from: 0.8, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.createConfetti();
    this.createFireworks();

    this.time.delayedCall(2000, () => {
      useRaceStore.getState().setGameState('finished');
    });
  }

  private createConfetti() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const colors = ['🎉', '✨', '🎊', '🎈', '🌟', '🎆', '💫', '🔥'];

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = -50 - Math.random() * 300;
      const emoji = colors[Math.floor(Math.random() * colors.length)];

      const particle = this.add.text(x, y, emoji, {
        fontSize: 25 + Math.random() * 20 + 'px'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: particle,
        y: height + 100,
        x: x + (Math.random() - 0.5) * 300,
        rotation: Math.random() * Math.PI * 4,
        duration: 2500 + Math.random() * 2000,
        delay: Math.random() * 2000,
        repeat: -1
      });
    }
  }

  private createFireworks() {
    const width = this.cameras.main.width;
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFD700, 0xFF00FF, 0x00FFFF];

    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 600, () => {
        const x = 100 + Math.random() * (width - 200);
        const y = 100 + Math.random() * 200;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.explodeFirework(x, y, color);
      });
    }

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        const x = 100 + Math.random() * (width - 200);
        const y = 100 + Math.random() * 200;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.explodeFirework(x, y, color);
      },
      loop: true
    });
  }

  private explodeFirework(x: number, y: number, color: number) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 60;

      const particle = this.add.ellipse(x, y, 8, 8, color);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: { from: 1, to: 0 },
        alpha: { from: 1, to: 0 },
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    const flash = this.add.ellipse(x, y, 100, 100, color, 0.8);
    this.tweens.add({
      targets: flash,
      scale: { from: 0, to: 2 },
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  }
}
