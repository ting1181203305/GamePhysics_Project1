class EndScene extends Phaser.Scene {
  constructor() {
    super({key: 'EndScene'});
  }

  preload() {
    this.load.spritesheet( 'codey_sled', 'images/codey_sled.png', { frameWidth: 81, frameHeight: 90 } );
  }

  create() {
    gameState.player = this.add.sprite(config.width / 2, config.height / 2, 'codey_sled');

    this.anims.create( {
                         key: 'sled',
                         frames: this.anims.generateFrameNumbers('codey_sled'),
                         frameRate: 10,
                         repeat: -1
                       } )

    gameState.player.angle = 20;
  }

  update() {
    gameState.player.anims.play('sled', true);
  }
}
