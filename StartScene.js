class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
      this.load.image('bg1', 'images/mountain.png');
      this.load.image('bg2', 'images/trees.png');
      this.load.image('bg3', 'images/snowdunes.png');
      this.load.image('snowflake', 'images/snowflake.png');
      this.load.image('logo', 'images/doggie-run-logo2.png');

  }

   create() {
       this.add.image(0, 0, 'bg1').setOrigin(0, 0);
       this.add.image(0, 0, 'bg2').setOrigin(0, 0);
       this.add.image(0, 0, 'bg3').setOrigin(0, 0);

       this.add.image((config.width / 2) - 150, (config.height / 2) - 130, 'logo').setOrigin(0).setScale(1.2);

       this.makeSnow();

       // on keypress any, transition to GameScene
       this.input.keyboard.on('keydown', () => {
           this.scene.stop('StartScene');
           this.scene.start('GameScene');
       });
    }

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

