import * as Phaser from 'phaser';

/**
 * Boot Scene - Load assets and prepare game
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    // Create loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);
    
    // Loading progress events
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // Generate placeholder textures
    this.generateTextures();
  }
  
  create() {
    // Transition to countdown scene
    this.scene.start('CountdownScene');
  }
  
  private generateTextures() {
    // Create duck texture (simplified)
    const duckGraphics = this.make.graphics({ x: 0, y: 0 });
    duckGraphics.fillStyle(0xFFD700, 1);
    duckGraphics.fillEllipse(20, 12, 40, 24);
    duckGraphics.fillCircle(32, 6, 10);
    duckGraphics.fillStyle(0xFF8C00, 1);
    duckGraphics.fillEllipse(40, 6, 10, 5);
    duckGraphics.fillStyle(0x000000, 1);
    duckGraphics.fillCircle(35, 4, 1.5);
    duckGraphics.fillStyle(0xFFA500, 1);
    duckGraphics.fillEllipse(15, 14, 16, 8);
    duckGraphics.generateTexture('duck', 50, 30);
  }
}
