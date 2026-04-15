import * as Phaser from 'phaser';
import type { Lane, DuckProfile, Obstacle } from '../../core/types/race';
import { RaceManager } from '../managers/RaceManager';
import { useRaceStore } from '../../store/raceStore';

export class RaceScene extends Phaser.Scene {
  private raceManager!: RaceManager;
  private raceTimerText!: Phaser.GameObjects.Text;
  private raceDuration: number = 10;
  private raceStartTime: number = 0;
  private isRaceActive: boolean = false;
  private lanes: Lane[] = [];
  private profiles: DuckProfile[] = [];
  private obstacles: Obstacle[] = [];
  
  constructor() {
    super({ key: 'RaceScene' });
  }
  
  init() {
    const store = useRaceStore.getState();
    this.lanes = store.lanes;
    this.profiles = store.profiles;
    this.obstacles = store.obstacles;
    this.raceDuration = store.raceDuration;
  }
  
  create() {
    this.cameras.main.setBackgroundColor('#87CEEB');
    this.createSky();
    
    this.raceManager = new RaceManager(
      this,
      this.lanes,
      this.profiles,
      this.obstacles
    );
    
    this.raceManager.create();
    this.createUI();
    
    this.events.on('race-ended', this.onRaceEnded, this);
    
    this.time.delayedCall(500, () => {
      this.startRace();
    });
  }

  private createSky() {
    // Multiple cloud layers with different speeds
    const cloudLayers = [
      { emoji: '☁️', size: 55, speed: 4000, y: 70, count: 4 },
      { emoji: '🌤️', size: 45, speed: 6000, y: 110, count: 3 },
      { emoji: '☁️', size: 40, speed: 3000, y: 90, count: 5 }
    ];

    cloudLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = (i / layer.count) * this.cameras.main.width + Math.random() * 200;
        const cloud = this.add.text(x, layer.y, layer.emoji, {
          fontSize: `${layer.size}px`
        }).setOrigin(0.5);

        // Floating animation
        this.tweens.add({
          targets: cloud,
          x: x + 50 + Math.random() * 100,
          y: layer.y + (Math.random() - 0.5) * 20,
          duration: layer.speed,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Sun with rays
    const sunX = this.cameras.main.width - 120;
    const sunY = 70;

    // Sun glow
    const sunGlow = this.add.graphics();
    sunGlow.fillStyle(0xFFFF66, 0.2);
    sunGlow.fillCircle(sunX, sunY, 60);
    this.tweens.add({
      targets: sunGlow,
      scale: { from: 1, to: 1.1 },
      alpha: { from: 0.2, to: 0.4 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sun core
    this.add.text(sunX, sunY, '🌞', {
      fontSize: '50px'
    }).setOrigin(0.5);

    this.createBirds();
  }

  private createBirds() {
    const birdEmojis = ['🐦', '🦅', '🕊️', '🐦‍⬛'];

    // Flying birds with varying speeds
    for (let i = 0; i < 5; i++) {
      const bird = this.add.text(
        -50 - i * 150,
        40 + Math.random() * 80,
        birdEmojis[i % birdEmojis.length],
        { fontSize: `${20 + Math.random() * 15}px` }
      );

      // Wing flap animation
      this.tweens.add({
        targets: bird,
        y: bird.y + 10,
        duration: 200 + Math.random() * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Fly across screen
      this.tweens.add({
        targets: bird,
        x: this.cameras.main.width + 100,
        duration: 10000 + i * 2000,
        repeat: -1,
        ease: 'Linear',
        delay: i * 3000,
        onRepeat: () => {
          bird.y = 40 + Math.random() * 80;
        }
      });
    }
  }
  
  private createUI() {
    // Timer in center top - counting UP from 0
    this.raceTimerText = this.add.text(
      this.cameras.main.width / 2,
      20,
      `Time: 0.0s`,
      {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5
      }
    ).setOrigin(0.5, 0);
    
    this.add.text(20, 20, '🏁 Race in Progress', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    });
  }
  
  private startRace() {
    this.isRaceActive = true;
    this.raceStartTime = this.time.now;
    
    useRaceStore.getState().setGameState('racing');
    useRaceStore.getState().setRaceStartTime(this.raceStartTime);
    
    this.raceManager.startRace();
    this.playRacingMusic();
    
    // Backup timeout - force end race after duration + 3 seconds buffer
    this.time.delayedCall((this.raceDuration + 3) * 1000, () => {
      if (this.isRaceActive && this.scene.isActive()) {
        console.log('Race timeout - forcing results screen');
        this.forceEndRace();
      }
    });
  }
  
  private forceEndRace() {
    this.isRaceActive = false;
    
    // Create results from profiles
    const results = this.profiles.map(p => ({
      rank: p.finishOrder,
      name: p.playerName,
      votes: p.votes
    })).sort((a, b) => a.rank - b.rank);
    
    // Transform to FinishResult format
    const finishResults = results.map(r => ({
      playerId: '',
      playerName: r.name,
      votes: r.votes,
      finishOrder: r.rank,
      isTie: false
    }));
    
    useRaceStore.getState().setCurrentResults(finishResults);
    useRaceStore.getState().setGameState('finished');
    
    this.playFinishSound();
    
    this.time.delayedCall(1000, () => {
      this.scene.start('FinishScene');
    });
  }
  
  update() {
    if (!this.isRaceActive) return;
    
    // Count UP from 0
    const elapsed = (this.time.now - this.raceStartTime) / 1000;
    
    this.raceTimerText.setText(`Time: ${elapsed.toFixed(1)}s`);
    
    // Warning color when approaching race duration limit
    if (elapsed > this.raceDuration - 3) {
      this.raceTimerText.setColor('#FF0000');
    }
  }
  
  private onRaceEnded(results: Array<{ rank: number; name: string; votes: number }>) {
    this.isRaceActive = false;
    
    // Transform to FinishResult format
    const finishResults = results.map(r => ({
      playerId: '',
      playerName: r.name,
      votes: r.votes,
      finishOrder: r.rank,
      isTie: false
    }));
    
    useRaceStore.getState().setCurrentResults(finishResults);
    useRaceStore.getState().setGameState('finished');
    
    this.playFinishSound();
    
    this.time.delayedCall(2000, () => {
      this.scene.start('FinishScene');
    });
  }
  
  private playRacingMusic() {
    const audioBlob = useRaceStore.getState().audioFiles.racing;
    if (audioBlob) {
      try {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
        (this as any).racingAudio = audio;
      } catch (e) {
        console.log('Failed to play racing music:', e);
      }
    }
  }
  
  private playFinishSound() {
    if ((this as any).racingAudio) {
      (this as any).racingAudio.pause();
      (this as any).racingAudio.currentTime = 0;
    }
    
    const audioBlob = useRaceStore.getState().audioFiles.finish;
    if (audioBlob) {
      try {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.volume = 0.7;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Failed to play finish music:', e);
      }
    } else {
      this.playDefaultVictorySound();
    }
  }
  
  private playDefaultVictorySound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';
        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }
  
  shutdown() {
    this.events.off('race-ended', this.onRaceEnded, this);
    if (this.raceManager) {
      this.raceManager.destroy();
    }
  }
}
