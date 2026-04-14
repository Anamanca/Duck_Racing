import * as Phaser from 'phaser';
import type { DuckProfile, Lane, Obstacle } from '../../core/types/race';
import { Duck } from '../entities/Duck';

export class RaceManager {
  private scene: Phaser.Scene;
  public ducks: Duck[] = [];
  private lanes: Lane[] = [];
  private obstacles: Obstacle[] = [];
  private profiles: DuckProfile[] = [];
  
  private currentFrame: number = 0;
  private isRunning: boolean = false;
  private finishedDucks: Array<{ duckId: string; finishOrder: number; playerName: string; votes: number }> = [];
  
  constructor(
    scene: Phaser.Scene,
    lanes: Lane[],
    profiles: DuckProfile[],
    obstacles: Obstacle[]
  ) {
    this.scene = scene;
    this.lanes = lanes;
    this.profiles = profiles;
    this.obstacles = obstacles;
  }
  
  create() {
    // Draw full background first
    this.drawFullBackground();
    
    // Draw river and lanes
    this.drawRiver();
    
    // Draw decorations
    this.drawDecorations();
    
    // Render obstacles
    this.renderObstacles();
    
    // Create ducks
    this.createDucks();
    
    // Draw start and finish zones
    this.drawMarkers();
    
    // Listen for finish events
    this.scene.events.on('duck-finished', this.onDuckFinished, this);
  }
  
  private drawFullBackground() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Sky gradient
    const graphics = this.scene.add.graphics();
    graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB0E0E6, 0xB0E0E6, 1);
    graphics.fillRect(0, 0, width, height * 0.4);
    
    // Grass/ground
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, height * 0.4, width, height * 0.6);
  }
  
  private drawRiver() {
    const graphics = this.scene.add.graphics();
    
    if (this.lanes.length === 0) return;
    
    const firstLane = this.lanes[0];
    const lastLane = this.lanes[this.lanes.length - 1];
    
    const riverTop = firstLane.yPosition - 60;
    const riverBottom = lastLane.yPosition + 60;
    const riverLeft = firstLane.startX - 80;
    const riverRight = firstLane.finishX + 80;
    
    // River water with gradient effect
    graphics.fillStyle(0x1E90FF, 1);
    graphics.fillRect(riverLeft, riverTop, riverRight - riverLeft, riverBottom - riverTop);
    
    // Water waves
    graphics.lineStyle(2, 0x87CEFA, 0.4);
    for (let y = riverTop + 15; y < riverBottom; y += 25) {
      this.drawWaveLine(graphics, riverLeft, riverRight, y);
    }
    
    // Lane dividers
    graphics.lineStyle(2, 0xFFFFFF, 0.5);
    for (let i = 0; i <= this.lanes.length; i++) {
      const y = riverTop + (i * (riverBottom - riverTop) / this.lanes.length);
      graphics.lineBetween(riverLeft, y, riverRight, y);
    }
  }
  
  private drawWaveLine(graphics: Phaser.GameObjects.Graphics, startX: number, endX: number, y: number) {
    graphics.beginPath();
    for (let x = startX; x < endX; x += 15) {
      const waveY = y + Math.sin(x / 25) * 2;
      if (x === startX) {
        graphics.moveTo(x, waveY);
      } else {
        graphics.lineTo(x, waveY);
      }
    }
    graphics.strokePath();
  }
  
  private drawDecorations() {
    const firstLane = this.lanes[0];
    const lastLane = this.lanes[this.lanes.length - 1];
    
    const riverTop = firstLane.yPosition - 60;
    const riverBottom = lastLane.yPosition + 60;
    const riverLeft = firstLane.startX - 80;
    const riverRight = firstLane.finishX + 80;
    
    // Left side - Trees, flowers, animals
    this.drawLeftSideDecorations(riverLeft - 150, riverTop - 50, riverBottom + 50);
    
    // Right side - Animals cheering
    this.drawRightSideDecorations(riverRight + 50, riverTop - 50, riverBottom + 50);
  }
  
  private drawLeftSideDecorations(leftBound: number, top: number, bottom: number) {
    // Trees
    for (let y = top + 30; y < bottom; y += 80) {
      this.scene.add.text(leftBound + Math.random() * 100, y, '🌳', {
        fontSize: '40px'
      }).setOrigin(0.5);
    }
    
    // Flowers
    const flowers = ['🌸', '🌺', '🌻', '🌷', '🌼'];
    for (let i = 0; i < 15; i++) {
      const x = leftBound + 20 + Math.random() * 120;
      const y = top + 20 + Math.random() * (bottom - top - 40);
      const flower = flowers[Math.floor(Math.random() * flowers.length)];
      this.scene.add.text(x, y, flower, {
        fontSize: '20px'
      }).setOrigin(0.5);
    }
    
    // Animals watching from left
    const animals = ['🦌', '🐊', '🐘', '🐻'];
    for (let i = 0; i < 4; i++) {
      const x = leftBound - 30 + Math.random() * 50;
      const y = top + 100 + i * 120;
      const animal = this.scene.add.text(x, y, animals[i], {
        fontSize: '35px'
      }).setOrigin(0.5);
      
      // Watching animation
      this.scene.tweens.add({
        targets: animal,
        scale: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private drawRightSideDecorations(rightBound: number, top: number, bottom: number) {
    // Animals cheering on the right
    const cheeringAnimals = ['🦛', '🐕', '🐈', '🐦', '🦅'];
    const positions = [0.1, 0.3, 0.5, 0.7, 0.9];
    
    positions.forEach((pos, index) => {
      const y = top + (bottom - top) * pos;
      const animal = this.scene.add.text(rightBound + 40, y, cheeringAnimals[index], {
        fontSize: '35px'
      }).setOrigin(0.5);
      
      // Cheer animation
      this.scene.tweens.add({
        targets: animal,
        y: y - 10,
        scale: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Power2',
        delay: index * 100
      });
    });
    
    // Bushes on right
    for (let y = top + 40; y < bottom; y += 100) {
      this.scene.add.text(rightBound + 80, y, '🌿', {
        fontSize: '30px'
      }).setOrigin(0.5);
    }
  }
  
  private renderObstacles() {
    this.obstacles.forEach(obs => {
      if (obs.isVirtual) return;
      
      const emoji = this.getObstacleEmoji(obs.type);
      const obstacle = this.scene.add.text(obs.position.x, obs.position.y, emoji, {
        fontSize: '40px'
      }).setOrigin(0.5);
      
      if (obs.type === 'whirlpool') {
        this.scene.tweens.add({
          targets: obstacle,
          rotation: Math.PI * 2,
          duration: 3000,
          repeat: -1,
          ease: 'Linear'
        });
      }
    });
  }
  
  private getObstacleEmoji(type: string): string {
    switch(type) {
      case 'rock': return '🪨';
      case 'log': return '🪵';
      case 'whirlpool': return '🌀';
      case 'branch': return '🌿';
      case 'duck-collision': return '💥';
      default: return '❓';
    }
  }
  
  private createDucks() {
    this.profiles.forEach(profile => {
      const lane = this.lanes.find(l => l.id === profile.laneId);
      if (lane) {
        const duck = new Duck(this.scene, profile, lane);
        this.ducks.push(duck);
      }
    });
  }
  
  private drawMarkers() {
    if (this.lanes.length === 0) return;
    
    const graphics = this.scene.add.graphics();
    const firstLane = this.lanes[0];
    const lastLane = this.lanes[this.lanes.length - 1];
    
    // Wider area for start/finish (3x original)
    const topY = firstLane.yPosition - 60;
    const bottomY = lastLane.yPosition + 60;
    const zoneWidth = 40; // Reduced from 120 to 40 (1/3 of previous)
    
    // START ZONE - Checkered pattern
    this.drawCheckeredZone(
      graphics,
      firstLane.startX - zoneWidth/2,
      topY,
      zoneWidth,
      bottomY - topY,
      0xFF0000,
      0xFFFFFF
    );
    
    // FINISH ZONE - Checkered pattern
    this.drawCheckeredZone(
      graphics,
      firstLane.finishX - zoneWidth/2,
      topY,
      zoneWidth,
      bottomY - topY,
      0x00FF00,
      0xFFFFFF
    );
    
    // Labels
    this.scene.add.text(firstLane.startX, topY - 30, 'START', {
      fontSize: '24px',
      color: '#FF0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.scene.add.text(firstLane.finishX, topY - 30, 'FINISH', {
      fontSize: '24px',
      color: '#00FF00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }
  
  private drawCheckeredZone(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color1: number,
    color2: number
  ) {
    const squareSize = 20;
    const cols = Math.ceil(width / squareSize);
    const rows = Math.ceil(height / squareSize);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isColor1 = (row + col) % 2 === 0;
        graphics.fillStyle(isColor1 ? color1 : color2, 0.6);
        graphics.fillRect(
          x + col * squareSize,
          y + row * squareSize,
          squareSize,
          squareSize
        );
      }
    }
    
    // Border
    graphics.lineStyle(3, color1, 1);
    graphics.strokeRect(x, y, width, height);
  }
  
  startRace() {
    this.isRunning = true;
    this.currentFrame = 0;
    this.finishedDucks = [];
    this.scene.events.on('update', this.update, this);
  }
  
  private update() {
    if (!this.isRunning) return;
    
    this.ducks.forEach(duck => {
      duck.update(this.currentFrame);
    });
    
    this.currentFrame++;
  }
  
  private onDuckFinished(data: { 
    duckId: string; 
    finishOrder: number; 
    playerName: string;
    votes: number;
  }) {
    if (this.finishedDucks.find(d => d.duckId === data.duckId)) return;
    
    this.finishedDucks.push(data);
    
    if (this.finishedDucks.length >= this.ducks.length) {
      this.endRace();
    }
  }
  
  private endRace() {
    this.isRunning = false;
    this.scene.events.off('update', this.update, this);
    
    const results = this.finishedDucks
      .sort((a, b) => a.finishOrder - b.finishOrder)
      .map(d => ({
        rank: d.finishOrder,
        name: d.playerName,
        votes: d.votes
      }));
    
    this.scene.events.emit('race-ended', results);
  }
  
  stopRace() {
    this.isRunning = false;
    this.scene.events.off('update', this.update, this);
  }
  
  destroy() {
    this.stopRace();
    this.scene.events.off('duck-finished', this.onDuckFinished, this);
    this.ducks.forEach(duck => duck.destroy());
    this.ducks = [];
  }
}
