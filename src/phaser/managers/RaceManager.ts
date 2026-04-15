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

    const graphics = this.scene.add.graphics();

    // Sky - simple blue gradient using multiple rects
    for (let y = 0; y < height * 0.45; y += 2) {
      const ratio = y / (height * 0.45);
      const r = Math.floor(74 + (135 - 74) * ratio);
      const g = Math.floor(144 + (206 - 144) * ratio);
      const b = Math.floor(217 + (255 - 217) * ratio);
      graphics.fillStyle((r << 16) | (g << 8) | b, 1);
      graphics.fillRect(0, y, width, 2);
    }

    // Sun glow
    graphics.fillStyle(0xFFFF99, 0.3);
    graphics.fillCircle(width - 150, 80, 60);
    graphics.fillStyle(0xFFFF66, 0.4);
    graphics.fillCircle(width - 150, 80, 40);

    // Distant hills
    graphics.fillStyle(0x3CB371, 0.6);
    graphics.fillEllipse(width * 0.2, height * 0.42, 300, 80);
    graphics.fillEllipse(width * 0.7, height * 0.43, 350, 90);
    graphics.fillStyle(0x2E8B57, 0.7);
    graphics.fillEllipse(width * 0.5, height * 0.44, 400, 70);

    // Grass/ground - simple green gradient
    for (let y = 0; y < height * 0.58; y += 2) {
      const ratio = y / (height * 0.58);
      const r = Math.floor(34 + (144 - 34) * ratio);
      const g = Math.floor(139 + (238 - 139) * ratio);
      const b = Math.floor(34 + (144 - 34) * ratio);
      graphics.fillStyle((r << 16) | (g << 8) | b, 1);
      graphics.fillRect(0, height * 0.42 + y, width, 2);
    }

    // Grass texture lines
    graphics.lineStyle(2, 0x006400, 0.3);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = height * 0.45 + Math.random() * (height * 0.5);
      graphics.lineBetween(x, y, x + 5, y - 10);
    }
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
    const riverWidth = riverRight - riverLeft;
    const riverHeight = riverBottom - riverTop;

    // River bank (dirt/sand edge)
    graphics.fillStyle(0xC2B280, 1);
    graphics.fillRect(riverLeft - 15, riverTop - 10, riverWidth + 30, riverHeight + 20);

    // River water - simple blue gradient
    for (let y = 0; y < riverHeight; y += 2) {
      const ratio = y / riverHeight;
      const r = Math.floor(30 + (135 - 30) * ratio);
      const g = Math.floor(144 + (206 - 144) * ratio);
      const b = Math.floor(255 - (255 - 235) * ratio);
      graphics.fillStyle((r << 16) | (g << 8) | b, 1);
      graphics.fillRect(riverLeft, riverTop + y, riverWidth, 2);
    }

    // Water shine/reflection
    graphics.fillStyle(0xFFFFFF, 0.15);
    for (let y = riverTop; y < riverBottom; y += 40) {
      graphics.fillRect(riverLeft + 20, y, riverWidth - 40, 3);
    }

    // Animated water waves
    graphics.lineStyle(3, 0x87CEFA, 0.3);
    for (let y = riverTop + 20; y < riverBottom - 20; y += 30) {
      this.drawWaveLine(graphics, riverLeft + 30, riverRight - 30, y, 1.5);
    }

    // Subtle wave pattern
    graphics.lineStyle(2, 0x00CED1, 0.2);
    for (let y = riverTop + 10; y < riverBottom; y += 20) {
      this.drawWaveLine(graphics, riverLeft, riverRight, y, 0.8);
    }

    // Lane dividers (subtle)
    graphics.lineStyle(2, 0xFFFFFF, 0.25);
    for (let i = 0; i <= this.lanes.length; i++) {
      const y = riverTop + (i * riverHeight / this.lanes.length);
      graphics.lineBetween(riverLeft, y, riverRight, y);
    }

    // River bank shadow top
    graphics.fillStyle(0x8B7355, 0.5);
    graphics.fillRect(riverLeft - 15, riverTop - 10, riverWidth + 30, 8);

    // River bank shadow bottom
    graphics.fillRect(riverLeft - 15, riverBottom + 2, riverWidth + 30, 8);
  }
  
  private drawWaveLine(graphics: Phaser.GameObjects.Graphics, startX: number, endX: number, y: number, amplitude: number = 1) {
    graphics.beginPath();
    for (let x = startX; x < endX; x += 15) {
      const waveY = y + Math.sin(x / 25) * (3 * amplitude);
      if (x === startX) {
        graphics.moveTo(x, waveY);
      } else {
        graphics.lineTo(x, waveY);
      }
    }
    graphics.strokePath();
  }
  
private drawDecorations() {
    if (this.lanes.length === 0) return;
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
    // Draw ground under decorations
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(leftBound - 80, top - 30, 200, bottom - top + 60);
    graphics.fillStyle(0x32CD32, 0.5);
    graphics.fillRect(leftBound - 80, top - 30, 200, 15);

    // Big trees with variation
    const treeEmojis = ['🌳', '🌲', '🎄', '🌴'];
    const treePositions = [
      { y: top + 40, x: leftBound + 20, size: 50 },
      { y: top + 150, x: leftBound + 60, size: 45 },
      { y: top + 280, x: leftBound + 10, size: 55 },
      { y: top + 400, x: leftBound + 70, size: 48 },
      { y: top + 530, x: leftBound + 30, size: 52 }
    ];

    treePositions.forEach((pos, i) => {
      const tree = this.scene.add.text(pos.x, pos.y, treeEmojis[i % treeEmojis.length], {
        fontSize: `${pos.size}px`
      }).setOrigin(0.5);

      // Gentle sway animation
      this.scene.tweens.add({
        targets: tree,
        angle: { from: -3, to: 3 },
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Flowers in various positions
    const flowers = ['🌸', '🌺', '🌻', '🌷', '🌼', '💐', '🌹'];
    for (let i = 0; i < 20; i++) {
      const x = leftBound - 40 + Math.random() * 140;
      const y = top + 30 + Math.random() * (bottom - top - 60);
      const flower = flowers[Math.floor(Math.random() * flowers.length)];
      const flowerObj = this.scene.add.text(x, y, flower, {
        fontSize: `${16 + Math.random() * 12}px`
      }).setOrigin(0.5);

      // Gentle bounce
      this.scene.tweens.add({
        targets: flowerObj,
        y: y - 3,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 1000
      });
    }

    // Mushrooms
    const mushrooms = ['🍄', '🍄', '🍁'];
    for (let i = 0; i < 6; i++) {
      const x = leftBound - 20 + Math.random() * 80;
      const y = bottom - 20 + Math.random() * 30;
      this.scene.add.text(x, y, mushrooms[i % mushrooms.length], {
        fontSize: '20px'
      }).setOrigin(0.5);
    }

    // Animals watching from left - with personality
    const animals = [
      { emoji: '🦌', y: top + 80, scale: 1.0 },
      { emoji: '🐿️', y: top + 200, scale: 0.9 },
      { emoji: '🐊', y: top + 320, scale: 1.1 },
      { emoji: '🐘', y: top + 440, scale: 1.2 },
      { emoji: '🐻', y: top + 560, scale: 1.0 }
    ];

    animals.forEach((animal, i) => {
      const animalObj = this.scene.add.text(leftBound + 50, animal.y, animal.emoji, {
        fontSize: `${35 * animal.scale}px`
      }).setOrigin(0.5);

      // Watching animation - look around
      this.scene.tweens.add({
        targets: animalObj,
        angle: { from: -10, to: 10 },
        scale: { from: animal.scale, to: animal.scale * 1.15 },
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Frogs sitting on lily pads
    for (let i = 0; i < 3; i++) {
      this.scene.add.text(leftBound - 30, top + 120 + i * 180, '🪷', {
        fontSize: '30px'
      }).setOrigin(0.5);

      const frog = this.scene.add.text(leftBound - 30, top + 100 + i * 180, '🐸', {
        fontSize: '24px'
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: frog,
        y: frog.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Power2',
        delay: i * 200
      });
    }
  }

  private drawRightSideDecorations(rightBound: number, top: number, bottom: number) {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(rightBound + 20, top - 30, 180, bottom - top + 60);
    graphics.fillStyle(0x32CD32, 0.5);
    graphics.fillRect(rightBound + 20, top - 30, 180, 15);

    // Cheering animals with more variety and animations
    const cheeringAnimals = [
      { emoji: '🦛', pos: 0.08, size: 40 },
      { emoji: '🐕', pos: 0.22, size: 35 },
      { emoji: '🐈', pos: 0.36, size: 32 },
      { emoji: '🐇', pos: 0.50, size: 30 },
      { emoji: '🦅', pos: 0.64, size: 38 },
      { emoji: '🦆', pos: 0.78, size: 34 },
      { emoji: '🐦', pos: 0.92, size: 28 }
    ];

    cheeringAnimals.forEach((animal, i) => {
      const y = top + (bottom - top) * animal.pos;
      const animalObj = this.scene.add.text(rightBound + 60, y, animal.emoji, {
        fontSize: `${animal.size}px`
      }).setOrigin(0.5);

      // Excited jumping animation
      this.scene.tweens.add({
        targets: animalObj,
        y: y - 15,
        scale: { from: 1, to: 1.3 },
        angle: { from: -15, to: 15 },
        duration: 300 + i * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Power2',
        delay: i * 100
      });
    });

    // Banner/flags cheering
    const bannerY = top - 20;
    for (let i = 0; i < 4; i++) {
      const banner = this.scene.add.text(rightBound + 40 + i * 35, bannerY, '🎉', {
        fontSize: '24px'
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: banner,
        angle: { from: -20, to: 20 },
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Power2',
        delay: i * 100
      });
    }

    // bushes and plants
    const bushes = ['🌿', '🌱', '☘️', '🍀'];
    for (let y = top + 30; y < bottom; y += 70) {
      const bush = this.scene.add.text(rightBound + 120, y, bushes[Math.floor(Math.random() * bushes.length)], {
        fontSize: '28px'
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: bush,
        y: y - 3,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 500
      });
    }

    // Standing sticks with balls
    for (let i = 0; i < 3; i++) {
      const stickY = top + 60 + i * 200;
      const balloon = this.scene.add.text(rightBound + 150, stickY, '🎈', {
        fontSize: '30px'
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: balloon,
        y: stickY - 20,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 300
      });
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

    const topY = firstLane.yPosition - 60;
    const bottomY = lastLane.yPosition + 60;
    const zoneWidth = 50;

    // START ZONE - Checkered with red/white
    this.drawCheckeredZone(
      graphics,
      firstLane.startX - zoneWidth / 2,
      topY,
      zoneWidth,
      bottomY - topY,
      0xFF4444,
      0xFFFFFF
    );

    // START banner/arch
    const startBanner = this.scene.add.text(firstLane.startX, topY - 25, '🏁 START', {
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Start flag animation
    this.scene.tweens.add({
      targets: startBanner,
      scale: { from: 1, to: 1.05 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });

    // FINISH ZONE - Checkered with green/white
    this.drawCheckeredZone(
      graphics,
      firstLane.finishX - zoneWidth / 2,
      topY,
      zoneWidth,
      bottomY - topY,
      0x44FF44,
      0xFFFFFF
    );

    // FINISH banner with checkered flag
    const finishBanner = this.scene.add.text(firstLane.finishX, topY - 25, 'FINISH 🏆', {
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#44FF44',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Finish celebration animation
    this.scene.tweens.add({
      targets: finishBanner,
      scale: { from: 1, to: 1.1 },
      angle: { from: -3, to: 3 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });

    // Add finish line streamers
    for (let i = 0; i < 5; i++) {
      const streamer = this.scene.add.text(
        firstLane.finishX - 30 + i * 15,
        topY - 45,
        '🎗️',
        { fontSize: '20px' }
      ).setOrigin(0.5);

      this.scene.tweens.add({
        targets: streamer,
        angle: { from: -10, to: 10 },
        duration: 300 + i * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Power2'
      });
    }
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
