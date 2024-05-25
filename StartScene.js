class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
      this.load.image('bg1', 'images/mountain.png');
      this.load.image('bg2', 'images/trees.png');
      this.load.image('bg3', 'images/snowdunes.png');
      this.load.image('logo', 'images/doggie-run-logo2.png');

      //this.load.spritesheet('doggy', 'images/doggy.png', { frameWidth: 48, frameHeight: 48 });
  }

   create() {
       this.add.image(0, 0, 'bg1').setOrigin(0, 0);
       this.add.image(0, 0, 'bg2').setOrigin(0, 0);
       this.add.image(0, 0, 'bg3').setOrigin(0, 0);

       this.add.image((config.width / 2) - 150, (config.height / 2) - 130, 'logo').setOrigin(0).setScale(1.2);

       //gameState.dog = this.add.sprite((config.width / 2), (config.height / 2) + 20, 'doggy');
       //gameState.dog.setScale(0.75);

       //this.anims.create({
       //    key: 'doggy',
       //    frames: this.anims.generateFrameNumbers('doggy', { frames: [0, 1, 2, 3] }),
       //    frameRate: 10,
       //    repeat: -1
       //});

       // on keypress any, transition to GameScene
       this.input.keyboard.on('keydown', () => {
           this.scene.stop('StartScene');
           this.scene.start('GameScene');
       });
    }

    //update() {
    //    gameState.dog.anims.play('doggy', true);
    //}

}

