const gameState = {
  active: false,
  maxSpeed: 0,
  enemySpeed: 0,
  playerSpeed: 0,
  score: 0,
  maxScore: 0,
  bushSpawnRate: 0,
  treeSpawnRate: 0,
  platformIndex: 0
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
