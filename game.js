const gameState = {
  fixedSpeed: 240,
  enemySpeed: 240,
  playerSpeed: 240,
  ups: 380,
  score: 0,
  spawnRate: 0.4,
  platformList: [],
  bushList: [],
};

const config = {
  type: Phaser.AUTO,
  width: 500,
  height: 600,
  fps: {target: 60},
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      enableBody: true,

    }
  },
  scene: [StartScene, GameScene, EndScene]
};

const game = new Phaser.Game(config);
