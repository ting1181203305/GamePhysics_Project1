const gameState = {
  active: false,
  devoured: false,
  treeCollider: {
    active:false, 
    currCollider: null, 
    prevCollider: null,
    temp_playerSpeed: 0,
    tempPlatformIndex: 0,
    functionActivated: false
  },
  bushCollider: {
    active:false, 
    currCollider: null, 
    prevCollider: null,
    activatedTime: null,
    slowReset: 0,
    functionActivated: false
  },
  maxSpeed: 0,
  enemySpeed: 0,
  playerSpeed: 0,
  maxGap: 0,
  gap: 0,
  currScore: 0,
  maxScore: 0,
  bushSpawnRate: 0,
  treeSpawnRate: 0,
  platformIndex: 0,
  timeEvent: null,
  startTime: null,
  elapsedTime: null
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
