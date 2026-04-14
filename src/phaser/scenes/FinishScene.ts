import * as Phaser from 'phaser';
import { useRaceStore } from '../../store/raceStore';
import type { FinishResult } from '../../core/types/race';

/**
 * Finish Scene - Display race results
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
    
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Title - CONGRATULATIONS
    const titleText = this.add.text(width / 2, 60, '🎉 CONGRATULATIONS! 🎉', {
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Title animation - pulse effect
    this.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Display top 5 results
    this.displayResults();
    
    // Instructions - wait for "Back to Settings" button
    this.add.text(width / 2, height - 80, 'Click "Back to Settings" to return', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // No auto-restart - user must click "Back to Settings" button
  }
  
  private displayResults() {
    const width = this.cameras.main.width;
    const startY = 140;
    const lineHeight = 80;
    
    this.results.slice(0, 5).forEach((result, index) => {
      const y = startY + index * lineHeight;
      // All players with rank 1 are winners (handles ties)
      const isWinner = result.finishOrder === 1;
      
      // Rank badge based on actual finishOrder, not index
      const rankEmojis: { [key: number]: string } = {
        1: '🥇',
        2: '🥈', 
        3: '🥉',
        4: '4️⃣',
        5: '5️⃣'
      };
      const rankEmoji = rankEmojis[result.finishOrder] || `${result.finishOrder}️⃣`;
      
      // Background bar - special for all rank 1 winners (handles ties)
      const graphics = this.add.graphics();
      if (isWinner) {
        // Golden background for all rank 1 winners
        graphics.fillStyle(0xFFD700, 0.3);
        graphics.fillRoundedRect(width / 2 - 320, y - 30, 640, 60, 15);
        graphics.lineStyle(3, 0xFFD700, 1);
        graphics.strokeRoundedRect(width / 2 - 320, y - 30, 640, 60, 15);
      } else {
        graphics.fillStyle(0x2a2a4e, 0.8);
        graphics.fillRoundedRect(width / 2 - 300, y - 25, 600, 50, 10);
      }
      
      // Rank - bigger for winners
      const rankText = this.add.text(width / 2 - 270, y, rankEmoji, {
        fontSize: isWinner ? '48px' : '36px'
      }).setOrigin(0, 0.5);
      
      // Winner rank animation
      if (isWinner) {
        this.tweens.add({
          targets: rankText,
          scale: { from: 1, to: 1.3 },
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      
      // Player name - bigger and golden for winners
      const nameText = this.add.text(width / 2 - 50, y, result.playerName, {
        fontSize: isWinner ? '36px' : '28px',
        fontStyle: 'bold',
        color: isWinner ? '#FFD700' : '#ffffff',
        stroke: '#000000',
        strokeThickness: isWinner ? 4 : 2
      }).setOrigin(0, 0.5);
      
      // Winner name glow animation
      if (isWinner) {
        this.tweens.add({
          targets: nameText,
          alpha: { from: 1, to: 0.7 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      
      // Votes (shown only in results)
      if (result.votes > 0) {
        this.add.text(width / 2 + 180, y, `🗳️ ${result.votes}`, {
          fontSize: isWinner ? '28px' : '24px',
          color: '#FFD700',
          fontStyle: isWinner ? 'bold' : 'normal'
        }).setOrigin(0, 0.5);
      }
      
      // Add "WINNER" label for all rank 1 (handles ties)
      if (isWinner) {
        this.add.text(width / 2 + 280, y, '👑 WINNER!', {
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#FF6B6B',
          stroke: '#FFFFFF',
          strokeThickness: 3
        }).setOrigin(0, 0.5);
        
        // Add "TIED" label if there are multiple winners
        if (result.isTie) {
          this.add.text(width / 2 + 400, y, '(TIED)', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#FFD700'
          }).setOrigin(0, 0.5);
        }
      }
      
      // Stagger animation
      this.tweens.add({
        targets: { y: y - 50 },
        y: y,
        duration: 500,
        delay: index * 200,
        ease: 'Back.out'
      });
    });
    
    // Winner celebration
    if (this.results.length > 0) {
      this.celebrateWinner();
    }
  }
  
  private celebrateWinner() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Get all winners (rank 1, handles ties)
    const winners = this.results.filter(r => r.finishOrder === 1);
    
    // Winner announcement text
    if (winners.length > 0) {
      let winnerTextStr: string;
      if (winners.length === 1) {
        winnerTextStr = `🏆 ${winners[0].playerName} 🏆`;
      } else {
        // Multiple winners (tie)
        const winnerNames = winners.map(w => w.playerName).join(' & ');
        winnerTextStr = `🏆 ${winnerNames} 🏆`;
      }
      
      const winnerText = this.add.text(width / 2, height - 150, winnerTextStr, {
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
    
    // Enhanced confetti effect
    const colors = ['🎉', '✨', '🎊', '🎈', '🌟', '🎆', '💫', '🔥'];
    
    // More particles
    for (let i = 0; i < 40; i++) {
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
    
    // Firework effects
    this.createFireworks();
  }
  
  private createFireworks() {
    const width = this.cameras.main.width;
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFD700, 0xFF00FF, 0x00FFFF];
    
    // Create periodic fireworks
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 800, () => {
        const x = 100 + Math.random() * (width - 200);
        const y = 100 + Math.random() * 200;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.explodeFirework(x, y, color);
      });
    }
    
    // Repeat fireworks
    this.time.addEvent({
      delay: 4000,
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
    const graphics = this.add.graphics();
    
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 60;
      
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, 4);
      
      // Animate particles outward
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
    
    // Flash effect
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
