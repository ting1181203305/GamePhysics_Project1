//End screen for winning
class EndScene extends Phaser.Scene {
  constructor() {
    super({key: 'EndScene'});
  }
  //preloading assets for the background & game logo
  preload() {
      this.load.image('platform', 'images/platform.png');
      this.load.image('bg1', 'images/mountain.png');
      this.load.image('bg2', 'images/trees.png');
      this.load.image('bg3', 'images/snowdunes.png');
      this.load.image('snowflake', 'images/snowflake.png');
      this.load.image('logo2', 'images/doggie-run-logo.png');
      this.load.image('thanks', 'images/thanks-msg.png');

      this.load.spritesheet('campfire', 'images/campfire.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('doggy', 'images/doggy.png', { frameWidth: 48, frameHeight: 48 });
  }
  //creating background & sprites for win screen
  create() {
      this.add.image(0, 0, 'bg1').setOrigin(0, 0);
      this.add.image(0, 0, 'bg2').setOrigin(0, 0);
      this.add.image(0, 0, 'bg3').setOrigin(0, 0);
      this.add.image((config.width / 2) - 100, 420, 'platform').setOrigin(0, 0);
      this.add.image((config.width / 2) - 235, (config.height / 2) - 270, 'logo2').setOrigin(0);
      this.add.image((config.width / 2) - 120, (config.height / 2), 'thanks').setOrigin(0);

      gameState.player = this.add.sprite((config.width / 2) - 15, 405, 'doggy');
      gameState.player.setScale(0.25);

      gameState.campfire = this.add.sprite((config.width / 2) + 20, 405, 'campfire');

      this.makeSnow();

      //creating animations for dog & campfire
      this.anims.create({
            key: 'doggy',
            frames: this.anims.generateFrameNumbers('doggy', { frames: [0, 4, 12, 8] }),
            frameRate: 4,
            repeat: -1
        });

      this.anims.create({
          key: 'campfire',
          frames: this.anims.generateFrameNumbers('campfire', { frames: [0,1,2] }),
          frameRate: 4,
          repeat: -1
      });

      this.input.keyboard.on('keydown', () => {
          this.scene.stop('EndScene');
          this.scene.start('StartScene');
      });

  }
  //updating animations
  update() {
      gameState.player.anims.play('doggy', true);
      gameState.campfire.anims.play('campfire', true);
  }
  //creating snowy weather
  makeSnow() {
      gameState.particles = this.add.particles('snowflake');

      gameState.emitter = gameState.particles.createEmitter({
          x: { min: 0, max: config.width * 2 },
          y: -5,
          lifespan: 2000,
          speedX: { min: -5, max: -200 },
          speedY: { min: 200, max: 400 },
          scale: { start: 0.6, end: 0 },
          quantity: 2,
          blendMode: 'ADD'
      });

      gameState.emitter.setScrollFactor(0);
  }
}
