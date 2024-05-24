class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
      this.load.image('platform', 'images/platform.png');
      this.load.image('snowflake', 'images/snowflake.png');
      this.load.image('bg1', 'images/mountain.png');
      this.load.image('bg2', 'images/trees.png');
      this.load.image('bg3', 'images/snowdunes.png');
  }

   create() {
    const screen = this.add.image(0, 0, 'start').setOrigin(0);

      this.add.image(0, 0, 'bg1').setOrigin(0, 0);
      this.add.image(0, 0, 'bg2').setOrigin(0, 0);
      this.add.image(0, 0, 'bg3').setOrigin(0, 0);

      let title = this.add.text(200, 250, "Doggie Run");
      let playButton = this.add.text(226, 330, "Play");

       title.setColor(rgb(0, 48, 143));
       playButton.setColor(rgb(0, 48, 143));

    // on keypress any, transition to GameScene
    this.input.keyboard.on('keydown', () => {
      this.scene.stop('StartScene');
      this.scene.start('GameScene');
    });
  }
}

