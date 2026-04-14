import * as Phaser from 'phaser';

/**
 * Countdown Scene - 5 second countdown before race
 */
export class CountdownScene extends Phaser.Scene {
  private countdownText!: Phaser.GameObjects.Text;
  private countdownValue: number = 5;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private isCounting: boolean = false;

  constructor() {
    super({ key: 'CountdownScene' });
  }

  init() {
    // Reset countdown when scene starts
    this.countdownValue = 5;
    this.isCounting = false;
    if (this.countdownTimer) {
      this.countdownTimer.destroy();
      this.countdownTimer = undefined;
    }
  }

  preload() {
    // Ensure audio context is ready
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      // Ignore audio errors
    }
  }
  
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Title
    this.add.text(width / 2, height / 3, '🦆 DUCK RACING 🦆', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Countdown text
    this.countdownText = this.add.text(width / 2, height / 2, '5', {
      fontSize: '120px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#FF0000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Instructions
    this.add.text(width / 2, height * 0.75, 'Get ready to race!', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Start countdown
    this.startCountdown();
  }
  
  private startCountdown() {
    if (this.isCounting) return;
    this.isCounting = true;
    
    // Play countdown sound if available
    this.playCountdownSound();
    
    // Create timer - count from 5 to 0 (6 steps: 5,4,3,2,1,0)
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateCountdown,
      callbackScope: this,
      repeat: 5
    });
    
    // Backup timeout to ensure transition happens even if timer fails
    this.time.delayedCall(6500, () => {
      if (this.scene.isActive() && this.countdownValue >= 0) {
        this.scene.start('RaceScene');
      }
    });
  }
  
  private updateCountdown() {
    if (!this.isCounting) return;
    
    this.countdownValue--;
    
    if (this.countdownValue > 0) {
      // Update text
      this.countdownText.setText(this.countdownValue.toString());
      
      // Play bell sound
      this.playCountdownSound();
      
      // Pulse animation
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 1 },
        duration: 300,
        ease: 'Back.out'
      });
    } else {
      // GO!
      this.countdownText.setText('GO!');
      this.countdownText.setColor('#00FF00');
      
      // Play start sound
      this.playStartSound();
      
      // Transition to race after brief delay
      this.time.delayedCall(500, () => {
        this.scene.start('RaceScene');
      });
    }
  }
  
  private playCountdownSound() {
    // Create simple bell sound using oscillator
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Audio not supported or blocked
    }
  }
  
  private playStartSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  }
  
  shutdown() {
    if (this.countdownTimer) {
      this.countdownTimer.destroy();
    }
  }
}
