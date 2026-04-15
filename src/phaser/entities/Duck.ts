import * as Phaser from 'phaser';
import type { DuckProfile, Lane, VelocityEntry } from '../../core/types/race';

/**
 * Duck entity representing a racing duck with cool effects
 */
export class Duck extends Phaser.GameObjects.Container {
  public profile: DuckProfile;
  public lane: Lane;
  
  private sprite: Phaser.GameObjects.Sprite;
  private nameLabel: Phaser.GameObjects.Text;
  private isFinished: boolean = false;
  private hasCorrected: boolean = false;
  private encounteredObstacles: Set<string> = new Set();
  private activeEffects: Map<string, boolean> = new Map();
  
  // Effect timers
  private effectTimer: number = 0;
  private lastVelocity: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    profile: DuckProfile,
    lane: Lane
  ) {
    super(scene, lane.startX, lane.yPosition);
    
    this.profile = profile;
    this.lane = lane;
    
    // Create duck sprite
    this.sprite = scene.add.sprite(0, 0, 'duck');
    if (!this.sprite.texture.key || this.sprite.texture.key === '__MISSING') {
      this.createPlaceholderDuck(scene);
    }
    
    this.sprite.setScale(1.2);
    
    // Name label
    this.nameLabel = scene.add.text(0, -55, profile.playerName, {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.add([this.sprite, this.nameLabel]);
    scene.add.existing(this);
    
    // Play swimming animation
    this.playSwimAnimation();
    
    // Create continuous wake effect
    this.createWakeTrail();
    
    // Create emotion indicator above duck
    this.createEmotionBubble();
  }
  
  private createPlaceholderDuck(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();

    // Duck colors
    const bodyColor = 0xFFD700;      // Golden yellow
    const bodyHighlight = 0xFFEC8B;   // Light gold
    const beakColor = 0xFF8C00;      // Dark orange
    const beakHighlight = 0xFFA500;  // Orange
    const eyeColor = 0x000000;       // Black
    const eyeHighlight = 0xFFFFFF;   // White
    const wingColor = 0xDAA520;      // Goldenrod

    // Shadow under duck
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(2, 18, 45, 15);

    // Body (main ellipse) with gradient effect
    graphics.fillStyle(bodyColor, 1);
    graphics.fillEllipse(0, 5, 45, 28);

    // Body highlight (top shine)
    graphics.fillStyle(bodyHighlight, 0.6);
    graphics.fillEllipse(-5, -2, 30, 15);

    // Tail feathers
    graphics.fillStyle(wingColor, 1);
    graphics.fillTriangle(-25, 0, -35, -8, -35, 12);

    // Wing
    graphics.fillStyle(wingColor, 1);
    graphics.fillEllipse(-8, 8, 25, 15);
    graphics.fillStyle(bodyColor, 0.7);
    graphics.fillEllipse(-8, 6, 18, 10);

    // Head
    graphics.fillStyle(bodyColor, 1);
    graphics.fillCircle(18, -8, 14);

    // Head highlight
    graphics.fillStyle(bodyHighlight, 0.5);
    graphics.fillCircle(15, -12, 8);

    // Beak
    graphics.fillStyle(beakColor, 1);
    graphics.fillTriangle(28, -8, 42, -6, 28, 0);

    // Beak highlight
    graphics.fillStyle(beakHighlight, 0.7);
    graphics.fillTriangle(28, -8, 38, -7, 28, -3);

    // Eye white
    graphics.fillStyle(eyeHighlight, 1);
    graphics.fillCircle(22, -12, 5);

    // Eye pupil
    graphics.fillStyle(eyeColor, 1);
    graphics.fillCircle(23, -12, 3);

    // Eye shine
    graphics.fillStyle(eyeHighlight, 1);
    graphics.fillCircle(24, -13, 1.5);

    // Cheek blush
    graphics.fillStyle(0xFFB6C1, 0.4);
    graphics.fillCircle(20, -4, 4);

    // Generate texture at larger size for better quality
    graphics.generateTexture('duck', 80, 60);
    graphics.destroy();
    this.sprite = scene.add.sprite(0, 0, 'duck');
  }
  
  private playSwimAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      y: { from: -2, to: 2 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Create continuous wake/water trail behind duck
   */
  private createWakeTrail() {
    // Create wake effect every 200ms
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        if (!this.isFinished && this.active) {
          this.spawnWakeParticle();
        }
      },
      loop: true
    });
  }
  
  private spawnWakeParticle() {
    const wake = this.scene.add.text(this.x - 20, this.y + 10, '💦', {
      fontSize: '16px'
    }).setOrigin(0.5).setAlpha(0.6);
    
    this.scene.tweens.add({
      targets: wake,
      x: this.x - 50,
      alpha: 0,
      scale: 0.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => wake.destroy()
    });
  }
  
  /**
   * Create emotion bubble above duck
   */
  private emotionBubble?: Phaser.GameObjects.Text;
  
  private createEmotionBubble() {
    this.emotionBubble = this.scene.add.text(15, -35, '', {
      fontSize: '24px'
    }).setOrigin(0.5);
    this.add(this.emotionBubble);
  }
  
  private showEmotion(emoji: string, duration: number = 1000) {
    if (this.emotionBubble) {
      this.emotionBubble.setText(emoji);
      this.emotionBubble.setAlpha(1);
      this.emotionBubble.setScale(0);
      
      this.scene.tweens.add({
        targets: this.emotionBubble,
        scale: { from: 0, to: 1.2 },
        duration: 200,
        ease: 'Back.out'
      });
      
      this.scene.time.delayedCall(duration, () => {
        this.scene.tweens.add({
          targets: this.emotionBubble,
          alpha: 0,
          scale: 0,
          duration: 200,
          onComplete: () => this.emotionBubble?.setText('')
        });
      });
    }
  }
  
  /**
   * Create wind/speed lines when moving fast
   */
  private createSpeedLines() {
    for (let i = 0; i < 3; i++) {
      const offsetX = -30 - Math.random() * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      const line = this.scene.add.text(this.x + offsetX, this.y + offsetY, '💨', {
        fontSize: '20px'
      }).setOrigin(0.5).setAlpha(0.4);
      
      this.scene.tweens.add({
        targets: line,
        x: this.x + offsetX - 30,
        alpha: 0,
        duration: 400,
        delay: i * 50,
        onComplete: () => line.destroy()
      });
    }
  }
  
  /**
   * Create splash ring effect
   */
  private createSplashRing() {
    const ring = this.scene.add.ellipse(this.x, this.y + 15, 40, 20, 0x87CEEB, 0);
    ring.setStrokeStyle(2, 0x87CEEB);
    
    this.scene.tweens.add({
      targets: ring,
      scaleX: 2,
      scaleY: 2,
      alpha: { from: 0.8, to: 0 },
      duration: 600,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }
  
  /**
   * Rainbow trail effect for boost
   */
  private rainbowTrail() {
    const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    
    colors.forEach((emoji, i) => {
      this.scene.time.delayedCall(i * 50, () => {
        const trail = this.scene.add.text(
          this.x - 20 - i * 10,
          this.y + (Math.random() - 0.5) * 10,
          emoji,
          { fontSize: '12px' }
        ).setOrigin(0.5).setAlpha(0.8);
        
        this.scene.tweens.add({
          targets: trail,
          x: this.x - 60 - i * 10,
          alpha: 0,
          duration: 500,
          onComplete: () => trail.destroy()
        });
      });
    });
  }
  
  /**
   * Floating stars effect when dizzy
   */
  private showDizzyStars() {
    const stars = ['⭐', '✨', '💫'];
    
    stars.forEach((star, i) => {
      const angle = (i / stars.length) * Math.PI * 2;
      const radius = 25;
      
      const starObj = this.scene.add.text(
        this.x + Math.cos(angle) * radius,
        this.y - 20 + Math.sin(angle) * radius,
        star,
        { fontSize: '16px' }
      ).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: starObj,
        rotation: Math.PI * 2,
        duration: 1000,
        repeat: 2,
        onComplete: () => starObj.destroy()
      });
    });
  }
  
  /**
   * Bouncing exclamation effect
   */
  private showExclamation() {
    const exclaim = this.scene.add.text(this.x + 20, this.y - 30, '❗', {
      fontSize: '24px'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: exclaim,
      y: this.y - 50,
      scale: { from: 1, to: 1.3 },
      duration: 300,
      yoyo: true,
      repeat: 1,
      onComplete: () => exclaim.destroy()
    });
  }
  
  /**
   * Lightning bolt effect for big boost
   */
  private showLightning() {
    const lightning = this.scene.add.text(this.x, this.y - 20, '⚡', {
      fontSize: '32px',
      color: '#FFD700'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: lightning,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      y: this.y - 40,
      duration: 300,
      repeat: 2,
      onComplete: () => lightning.destroy()
    });
  }
  
  /**
   * Update duck with effects
   */
  update(frame: number) {
    if (this.isFinished) return;
    
    let timelineEntry = this.profile.velocityTimeline[frame];
    
    if (!timelineEntry) {
      if (this.lastVelocity > 0) {
        this.x += this.lastVelocity * (1/60);
      }
    } else {
      this.x = timelineEntry.targetX;
      this.lastVelocity = timelineEntry.velocity;
      
      if (frame > 0) {
        const prevEntry = this.profile.velocityTimeline[frame - 1];
        if (prevEntry) {
          const deltaX = timelineEntry.targetX - prevEntry.targetX;
          const targetRotation = Math.atan2(0, deltaX) * 0.1;
          this.sprite.setRotation(targetRotation);
        }
      }
      
      // Effect timer
      this.effectTimer++;
      
      // Speed-based effects
      const velocityRatio = timelineEntry.velocity / this.profile.baseVelocity;
      
      // High speed effects
      if (velocityRatio > 1.3) {
        // Super boost - show lightning occasionally
        if (this.effectTimer % 30 === 0) {
          this.showLightning();
          this.showEmotion('😤', 800); // Determined face
          this.rainbowTrail();
        }
        // Speed lines
        if (this.effectTimer % 10 === 0) {
          this.createSpeedLines();
        }
      }
      else if (velocityRatio > 1.1) {
        // Normal boost
        if (this.effectTimer % 20 === 0) {
          this.createSpeedLines();
          this.showEmotion('😠', 600); // Focused face
        }
      }
      else if (velocityRatio < 0.7) {
        // Slow/obstacle - show sweat
        if (this.effectTimer % 40 === 0) {
          this.showEmotion('😰', 800); // Sweating
        }
      }
      else {
        // Normal speed - happy swimming
        if (this.effectTimer % 60 === 0) {
          this.showEmotion('😊', 500); // Happy face
        }
      }
      
      // Event-based effects
      if (timelineEntry.event === 'obstacle' && this.effectTimer % 20 === 0) {
        this.showDizzyStars();
        this.showExclamation();
        this.showEmotion('😵', 1000); // Dizzy face
      }
      
      if (timelineEntry.event === 'boost' && this.effectTimer % 15 === 0) {
        this.createSplashRing();
      }
      
      this.checkCorrectionPoint(timelineEntry);
      this.handleEffects(timelineEntry);
      this.checkObstacles(timelineEntry);
    }
    
    if (this.x >= this.lane.finishX) {
      this.finish();
    }
  }
  
  private checkCorrectionPoint(entry: VelocityEntry) {
    const correctionX = this.profile.correctionPoint.xPosition;
    const isAtCorrection = Math.abs(entry.targetX - correctionX) < 30;
    
    if (isAtCorrection && !this.hasCorrected) {
      this.hasCorrected = true;
      if (entry.event === 'boost' || entry.velocity > this.profile.baseVelocity * 1.3) {
        this.showEmotion('💪', 1000); // Flexing
      } else if (entry.event === 'obstacle') {
        this.showEmotion('🥺', 800); // Pleading face
      }
    }
  }
  
  private handleEffects(entry: VelocityEntry) {
    const hasBoost = entry.velocity > this.profile.baseVelocity * 1.2;
    const hasSlowdown = entry.velocity < this.profile.baseVelocity * 0.8;
    
    if (hasBoost && !this.activeEffects.get('boost')) {
      this.activeEffects.set('boost', true);
    } else if (!hasBoost) {
      this.activeEffects.delete('boost');
    }
    
    if (hasSlowdown && !this.activeEffects.get('slowdown')) {
      this.activeEffects.set('slowdown', true);
    } else if (!hasSlowdown) {
      this.activeEffects.delete('slowdown');
    }
  }
  
  private checkObstacles(entry: VelocityEntry) {
    this.profile.obstacles.forEach(obs => {
      if (this.encounteredObstacles.has(obs.id)) return;
      
      const distance = Math.abs(obs.position.x - entry.targetX);
      if (distance < 30) {
        this.playObstacleAnimation(obs.type);
        this.encounteredObstacles.add(obs.id);
      }
    });
  }
  
  private playObstacleAnimation(type: string) {
    switch(type) {
      case 'rock':
        this.playJumpAnimation();
        break;
      case 'whirlpool':
        this.playSpinAnimation();
        break;
      case 'log':
        this.playDiveAnimation();
        break;
      case 'branch':
        this.playStuckAnimation();
        break;
      case 'duck-collision':
        this.playBumpAnimation();
        break;
    }
  }
  
  private playJumpAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      y: -20,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
    this.showEmotion('😮', 500);
  }
  
  private playSpinAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Linear'
    });
    this.showDizzyStars();
  }
  
  private playDiveAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0.8,
      duration: 300,
      yoyo: true,
      ease: 'Power1'
    });
    this.showEmotion('🥽', 600);
  }
  
  private playStuckAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      x: '-=5',
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Linear'
    });
    this.showEmotion('😫', 800);
  }
  
  private playBumpAnimation() {
    this.scene.tweens.add({
      targets: this.sprite,
      x: '-=10',
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
    this.showExclamation();
  }
  
  private finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    
    this.scene.tweens.add({
      targets: this.sprite,
      y: -30,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
    
    this.showEmotion('🎉', 2000);
    
    this.scene.events.emit('duck-finished', {
      duckId: this.profile.playerId,
      finishOrder: this.profile.finishOrder,
      playerName: this.profile.playerName,
      votes: this.profile.votes
    });
  }
  
  isDuckFinished(): boolean {
    return this.isFinished;
  }
  
  getCurrentRank(): number {
    return this.profile.finishOrder;
  }
}
