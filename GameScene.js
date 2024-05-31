class GameScene extends Phaser.Scene {
  //Scene name
  constructor() {
    super({ key: 'GameScene' });
  }

  //Preload required asset
  preload() {
    this.load.image('platform', 'images/platform.png');
    this.load.image('snowflake', 'images/snowflake.png');
    this.load.image('bg1', 'images/mountain.png');
    this.load.image('bg2', 'images/trees.png');
    this.load.image('bg3', 'images/snowdunes.png');
    this.load.image('bush1', 'images/snowy_bush_1.png');
    this.load.image('bush2', 'images/snowy_bush_2.png');
    this.load.image('pineTree', 'images/winter_pinetree_1.png')

    this.load.spritesheet('campfire', 'images/campfire.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('doggy', 'images/doggy.png', { frameWidth: 160, frameHeight: 160 });
    this.load.spritesheet('wolf', 'images/wolf.png', { frameWidth: 48, frameHeight: 48 });
  }

  //When the game scene was created
  create() {
    //Initialize the game state
    this.initState();
    //Creating the game backgrounds
    this.createParallaxBackgrounds();
    //Creating the animations from the sprite sheet / png
    this.createAnimations();
    //Functions that create the snow effects
    this.createSnow();
    //Function that create the player object
    this.createPlayer();
    //Function that create the enemy object
    this.createEnemy();
    //Function that generates the level scene, e.g. platforms,
    //obstacles like bushes and trees, and goal
    this.levelSetup();
    //Function that initialize the camera setup
    this.initCamera();
    //Setting up collider for the game objects within the scene
    this.setCollider();
    //objectOverlap() executes the functions held when the specific object overlaps with the another object
    //e.g player collides with bushes, then executes the function held
    this.objectOverlap();
    //sceneGUI runs the simple text for score and alpha background when the game starts or ends
    this.sceneGUI();

    //pauses all animation after created
    this.anims.pauseAll();
  } // create()

  initState() {
    //init game cursors for the keyboard inputs
    gameState.cursors = this.input.keyboard.createCursorKeys();
    //gameState active represents the pause status of whole game
    gameState.active = false;
    //gameState treeCollider held the required variables during collision
    gameState.treeCollider = {
      active: false,
      currCollider: null,
      prevCollider: null,
      temp_playerSpeed: 0,
      tempPlatformIndex: 0,
      functionActivated: false
    };
    //gameState bushCollider held the required variables during collision
    gameState.bushCollider = {
      active: false,
      currCollider: null,
      prevCollider: null,
      timeReset: 0,
      functionActivated: false
    };
    //maxSpeed held the fixed maximum speed that a player can move
    //both enemySpeed and playerSpeed with be set as maxSpeed initially
    gameState.maxSpeed = 240;
    gameState.enemySpeed = gameState.maxSpeed;
    gameState.playerSpeed = gameState.maxSpeed;
    gameState.tempSpeed = 0;
    //maxGap represents the max distance between the enemy and player
    //currGap will be set as maxGap initially
    gameState.maxGap = 200;
    gameState.currGap = gameState.maxGap;
    //currScore held the player's score and the score is count according to the distance progressed
    //maxScore represents both the maximum score player can held
    //and it also represents how long the game could generate the platform and obstacles
    //e.g. 50000; for each 12500 score respectively, the background scene will change
    //            and the platforms and obstacles should generate accordingly
    gameState.currScore = 0;
    gameState.maxScore = 10000;
    //bush spawn rate and tree spawn rate for every individual platform
    gameState.bushSpawnRate = 0.6;
    gameState.treeSpawnRate = 0.1;
    gameState.timeEvent = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        // gameState.elapsedTime = new Date();
        // gameState.deltaTime = 1;
      }
    });
    //startTime held the time when the game scene initialize
    gameState.startTime = new Date().getTime();
    gameState.deltaTime = 0;
  } //initState()

  createParallaxBackgrounds() {
    const game_width = parseFloat(config.width + gameState.maxScore);
    gameState.width = game_width;
    const window_width = config.width;

    gameState.bgColor = this.add.rectangle(0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);

    this.createStars();

    gameState.bg1 = this.add.image(0, 0, 'bg1');
    gameState.bg2 = this.add.tileSprite(0, 0, game_width, this.textures.get('bg2').getSourceImage().height, 'bg2');
    gameState.bg3 = this.add.tileSprite(0, 0, game_width, this.textures.get('bg3').getSourceImage().height, 'bg3');

    gameState.bg1.setOrigin(0, 0);
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);

    const bg1_width = gameState.bg1.getBounds().width
    const bg2_width = gameState.bg2.getBounds().width
    const bg3_width = gameState.bg3.getBounds().width

    
    gameState.bgColor.setScrollFactor(0);
    gameState.bg1.setScrollFactor((bg1_width - window_width) / (game_width - window_width));
    gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));
    gameState.bg3.setScrollFactor((bg2_width - window_width) / (game_width - window_width));

  } // createParallaxBackgrounds()

  createStars() {
    gameState.stars = [];

    function getStarPoints() {
      const color = 0xffffff;
      return {
        x: Math.floor(Math.random() * 900),
        y: Math.floor(Math.random() * config.height * .5),
        radius: Math.floor(Math.random() * 3),
        color,
      }
    }

    for (let i = 0; i < 200; i++) {
      const { x, y, radius, color } = getStarPoints();
      const star = this.add.circle(x, y, radius, color)
      star.setScrollFactor(Math.random() * .1);
      gameState.stars.push(star)
    }
  } // createStars

  createAnimations() {
    //create animations for the doggy, which is the player
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('doggy', { frames: [8, 9, 10, 11] }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('doggy', { frames: [0, 2] }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('doggy', { frames: [14, 12] }),
      frameRate: 10,
      repeat: -1
    });

    //create animations for the wolf, which is the enemy
    this.anims.create({
      key: 'enemyidle',
      frames: this.anims.generateFrameNumbers('wolf', { frames: [9, 11] }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemyRun',
      frames: this.anims.generateFrameNumbers('wolf', { frames: [8, 9, 10, 11] }),
      frameRate: 10,
      repeat: -1
    });

    //create animations for the fire, which is the goal
    this.anims.create({
      key: 'fire',
      frames: this.anims.generateFrameNumbers('campfire'),
      frameRate: 10,
      repeat: -1
    })
  } // createAnimations()

  createSnow() {
    gameState.particles = this.add.particles('snowflake');

    gameState.emitter = gameState.particles.createEmitter({
      x: { min: 0, max: config.width * 2 },
      y: -5,
      lifespan: 2000,
      speedX: { min: -5, max: -200 },
      speedY: { min: 200, max: 400 },
      scale: { start: 0.6, end: 0 },
      quantity: 10,
      blendMode: 'ADD'
    }
    )

    gameState.emitter.setScrollFactor(0);
  } // createSnow()

  setWeather(weather) {
    // weathers held the tint color, snow drop rate and
    // also the wind that reduces the speed of both player and enemy progression 
    // of the specific timelines/score.
    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'bgColor': 0xF8c3aC,
        'snow': 1,
        'wind': 20,
      },

      'afternoon': {
        'color': 0xffffff,
        'bgColor': 0x0571FF,
        'snow': 1,
        'wind': 80,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow': 10,
        'wind': 200,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow': 0,
        'wind': 0,
      },
    }

    let { color, bgColor, snow, wind } = weathers[weather];

    gameState.bg1.setTint(color);
    gameState.bg2.setTint(color);
    gameState.bg3.setTint(color);
    gameState.bgColor.fillColor = bgColor;
    gameState.emitter.setQuantity(snow);
    gameState.emitter.setSpeedX(-wind);
    gameState.player.setTint(color);
    gameState.enemy.setTint(color);

    for (let platform of gameState.platforms.getChildren()) {
      platform.setTint(color);
    }
    for (let bush of gameState.bushes.getChildren()) {
      bush.setTint(color);
    }
    for (let tree of gameState.trees.getChildren()) {
      tree.setTint(color);
    }

    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }

    return
  } // setWeather(weather)

  levelSetup() {
    //There were total of 3 layers of platform in which player could go with
    //Then the obstacles like bushes and trees were also generated when the platform is spawned
    //The game will always goes with the weather set as afternoon
    let topLayerY = 320, midLayerY = 420, btmLayerY = 520;
    gameState.platforms = this.physics.add.staticGroup();
    gameState.bushes = this.add.group();
    gameState.trees = this.add.group();

    this.initPlatform(topLayerY);
    this.initPlatform(midLayerY);
    this.initPlatform(btmLayerY);
    this.createGoal(midLayerY);
    this.setWeather('afternoon');
  } // levelSetup()

  initPlatform(layerY) {
    //We estimate the amount of platforms required to generate for the total width of the entire game
    //If the platformIndex has decimals, we increment the index so that the platforms covers all the width.
    let platformWidth = this.textures.get('platform').getSourceImage().width;
    let tempIndex = 0;
    gameState.platformIndex = gameState.width / platformWidth;
    if (gameState.platformIndex % 1 != 0) gameState.platformIndex = parseInt(gameState.platformIndex) + 1;

    //These are the settings for the random generation of obstacles
    //bush scale and tree scale were initialize here
    let random;
    let randomPlacement;
    let bushScale = 0.25;
    let treeScale = 0.2;

    //We runs the platform generation until the tempIndex reaches the maximum platformIndex
    while (tempIndex <= gameState.platformIndex) {
      //platform variable is used to held the spawned platform,
      //then was stored into gameState.platforms as a group
      let platform = this.physics.add.staticGroup().create(
        (platformWidth * tempIndex),
        layerY,
        'platform'
      ).setScale(1, 0.5).setOrigin(0, 0.5).refreshBody();
      gameState.platforms.add(platform);

      //We spawn at tempIndex 0 as decorations,
      //While spawning on index 3 and forwards as obstacles until 2 tiles before the goal
      if (tempIndex == 0 || tempIndex >= 3 && tempIndex < gameState.platformIndex - 2) {
        //random was used to indicate whether the bush will be spawn, true if less than the spawn rate
        //randomPlacement should represents the placement of obstacles on the following platform
        //randomTexture chooses the texture in between integer 0 and 1
        //bushString concatenate with the randomPlacement to indicate which texture would be used
        //bush would be generated and stored in gameState.bushes
        random = Phaser.Math.FloatBetween(0, 1);
        randomPlacement = Phaser.Math.FloatBetween(0, 1)
        if (random <= gameState.bushSpawnRate) {
          let randomTexture = Phaser.Math.Between(1, 2);
          let bushString = 'bush' + randomTexture;
          let bushWidth = this.textures.get(bushString).getSourceImage().width * bushScale;
          let bushHeight = this.textures.get(bushString).getSourceImage().height * bushScale;

          let bush = this.physics.add.sprite(
            ((platformWidth * tempIndex) + (platformWidth - bushWidth) * randomPlacement),
            (layerY - 10 - bushHeight),
            bushString
          ).setScale(bushScale);
          gameState.bushes.add(bush);
        }

        //random and randomPlacement must recalculate for the tree obstacles.
        //tree would be generated and stored in gameState.trees
        random = Phaser.Math.FloatBetween(0, 1);
        randomPlacement = Phaser.Math.FloatBetween(0, 1)
        if (random <= gameState.treeSpawnRate) {
          let treeWidth = this.textures.get('pineTree').getSourceImage().width * treeScale;
          let treeHeight = this.textures.get('pineTree').getSourceImage().height * treeScale;

          let tree = this.physics.add.sprite(
            ((platformWidth * tempIndex) + (platformWidth - treeWidth) * randomPlacement),
            (layerY - 10 - treeHeight),
            'pineTree'
          ).setScale(treeScale).setOrigin(0.5);
          gameState.trees.add(tree);
        }
      }

      tempIndex++;
    };
  } //initPlatform()

  createPlayer() {
    //basic initialize of player object and settings
    let texture_width = 160;
    let texture_height = 120;
    let scale = 0.25;
    let x = config.width / 2;
    let y = 420 - (texture_height * scale);
    gameState.player = this.physics.add.sprite(x, y, 'doggy').setSize(texture_width, texture_height);
    gameState.player._onPlatformIndex = 1; // platformIndex to hold current platform index; 0 = top, 1 = mid, 2 = bottom
    gameState.player.platformSwitch = true;
    gameState.player.width = texture_width;
    gameState.player.height = texture_height;
    gameState.player.Scale = scale;
    gameState.player.setScale(scale);
    gameState.player.anims.play('run', true);
  } // createPlayer()

  createEnemy() {
    //basic initialize of enemy object and settings
    let texture_width = 30;
    let texture_height = 46;
    let scale = 1;
    let x = gameState.player.x - gameState.maxGap - texture_width;
    let y = gameState.player.y - 5;
    gameState.enemy = this.physics.add.sprite(x, y, 'wolf').setSize(texture_width, texture_height);
    gameState.enemy.width = texture_width;
    gameState.enemy.height = texture_height;
    gameState.enemy.Scale = scale;
    gameState.enemy.setScale(scale);
    gameState.enemy.anims.play('enemyRun', true);

    gameState.maxGap = parseInt(gameState.player.x - gameState.enemy.x + gameState.enemy.width);
    gameState.currGap = gameState.maxGap;
  } // createEnemy()

  createGoal(layerY) {
    // Create the campfire at the end of the level
    gameState.goal = this.physics.add.sprite(gameState.width - 40, layerY - this.textures.get('campfire').getSourceImage().height, 'campfire');
    gameState.goal.anims.play('fire', true);
    gameState.goal.repelWidth = 500;
    gameState.goal.repelRadius = gameState.goal.repelWidth / 2;
  } //createGoal()

  sceneGUI() {
    //alphaScreen is the see through screen before the game starts and after the player was caught
    //textScore is the text used to display the
    gameState.alphaScreen = this.add.rectangle(0, 0, config.width, config.height, 0x808080).setOrigin(0, 0);
    gameState.alphaScreen.setAlpha(0.75).setScrollFactor(0);
    gameState.textScore = this.add.text(config.width / 2, 10, 'Score ' + gameState.currScore).setColor('#000000').setOrigin(0.5);
    gameState.textScore.setFontSize(24).setVisible(false).setScrollFactor(0);
    gameState.textStartGame = this.add.text(config.width / 2, config.height / 2 + 50, 'Press Space to Start').setColor('#000000').setOrigin(0.5);
    gameState.textStartGame.setFontSize(28).setScrollFactor(0);
  } //sceneGUI()

  initCamera() {
    this.cameras.main.setBounds(0, 0, gameState.width, gameState.bg3.height);
    this.physics.world.setBounds(0, 0, gameState.width, gameState.bg3.height + gameState.player.height);

    // Camera following the target
    // lerpX, lerpY :
    //    - https://newdocs.phaser.io/docs/3.52.0/focus/Phaser.Cameras.Scene2D.Camera-lerp
    //    - The default values of 1 means the camera will instantly snap to the target coordinates.
    //    - A lower value, such as 0.1 means the camera will more slowly track the target, giving a smooth transition. 
    //    - You can set the horizontal and vertical values independently, and also adjust this value in real-time during your game.
    //    - A value of zero will disable tracking on that axis

    // TASK : find and change good values for lerpX and lerpY so that the camera will track the player smoothly
    this.cameras.main.startFollow(
      gameState.player, // target - sprite for the camera to follow
      true,             // roundPixels - a boolean, set it to true if experiencing camera jitter
      1, 0.0            // lerpX, lerpY - speed (between 0 and 1, defaults to 1)
      //                 with which the camera locks on to the target
    )
  } //initCamera()

  setCollider() {
    //Setting up collider between game objects
    gameState.player.setCollideWorldBounds(true);

    this.physics.add.collider(gameState.player, gameState.platforms);
    this.physics.add.collider(gameState.enemy, gameState.platforms);
    this.physics.add.collider(gameState.bushes, gameState.platforms);
    this.physics.add.collider(gameState.trees, gameState.platforms);
    this.physics.add.collider(gameState.goal, gameState.platforms);
  } //setCollider()

  objectOverlap() {
    this.physics.add.overlap(gameState.player, gameState.goal,
      function () {
        this.cameras.main.fade(800,     // duration in milliseconds
          0, 0, 0, // amount to fade the red, green, blue channels towards
          false,   // true or false, force the effect to start immediately, even if already running 
          function (camera, progress) {
            if (progress > .9) {
              this.scene.stop('GameScene');
              this.scene.start('EndScene');
            }
          }
        );
      },
      null, this
    );

    //When player and enemy collide, we pauses all the game physics and animations.
    //gameState.active will be set false to indicate the game ended. No further update will follow.
    //The alphaScreen will be set visible again and text to request restart will be shown
    //The player has to mouse click to restart the scene
    this.physics.add.overlap(gameState.player, gameState.enemy,
      function () {
        this.physics.pause();
        gameState.active = false;
        this.anims.pauseAll();

        gameState.alphaScreen.setVisible(true);
        gameState.textRestart = this.add.text(config.width / 2, config.height / 2,
          'GameOver!\nClick to play again.'
        ).setFontSize(28).setAlign('center').setColor('#ff1f4b').setOrigin(0.5,0.5).setScrollFactor(0);

        this.input.on('pointerup',
          () => {
            this.scene.restart();
          }
        )
      },
      null, this
    )

    //When player collide with the bush, this function will set the bushCollider as active
    //the following bush will be referenced within the gameState.bushCollider as currCollider
    //We attempt to add individual collider for each of the bush
    gameState.bushes.getChildren().forEach(bush => {
      this.physics.add.overlap(gameState.player, bush,
        function () {
          gameState.bushCollider.active = true;
          gameState.bushCollider.currCollider = bush;
        },
        null, this
      )
    }
    );

    //When player collide with the tree, this function will set the treeCollider as active
    //the following tree will be referenced within the gameState.treeCollider as currCollider
    //We attempt to add individual collider for each of the tree
    gameState.trees.getChildren().forEach(tree => {
      this.physics.add.overlap(gameState.player, tree,
        function () {
          gameState.treeCollider.active = true;
          gameState.treeCollider.currCollider = tree;
        },
        null, this
      )
    }
    );
  } // objectOverlap()

  update() {
    //elapsedTime indicates the time elapsed when running this scene
    gameState.elapsedTime = parseInt((new Date().getTime() - gameState.startTime) / 1000);

    //if the gameState.active is true, then we check and update all the contents
    if (gameState.active) {
      //Checking the gap in between the player and the enemy
      this.checkGap();
      //This will update the center position of the game object, player, enemy and goal
      this.objectCenter();
      //updateScore will update the text used to display the score
      this.updateScore();
      //scoreSetting will be used to set the weather regarding of the score
      this.scoreSetting();
      //collisionHandler handles the collision in between the game object
      this.collisionHandler();

      //try catch attempt to catch the exception if any
      try {
        //playerMovement to check whether actions were required if any keys was pressed 
        this.playerMovement();
        //enemyMovement to follow the player when player switch the lane
        this.enemyMovement();
      } catch (error) {
        console.log("Exception thrown:" + error);
      }

      //This function attempt to handle the gameObject player or enemy when they fell out of the bound.
      this.outOfBound();
    }
    else {  //if the gameState.active is false

      //This ensures that the game is not started
      //But start the game when player pressed the spacebar
      //All animations will resume their own
      if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && !gameState.active) {
        gameState.active = true;
        gameState.alphaScreen.setVisible(false);
        gameState.textStartGame.destroy();
        gameState.textScore.setVisible(true);
        this.anims.resumeAll();
      }
    }
  } // update()

  checkGap(){
    //checkGap checks the current gap in between player and enemy
    //And if the gap is greater than the maximum gap provided
    //Player speed will be set to maximum speed provided.
    gameState.currGap = parseInt(gameState.player.x - gameState.enemy.x + gameState.enemy.width);
    if(gameState.currGap > gameState.maxGap){
      gameState.currGap = gameState.maxGap;
      gameState.playerSpeed = gameState.maxSpeed;
    }
  }// checkGap()

  updateScore() {
    //We calculate the score using the current player's center position and the 
    //initial position of the player when the game runs
    //then, the text for Score is updated accordingly.
    //but it fixed when the traversed distance is greater than the maximum score
    let Score = parseInt(gameState.player.center.x - config.width / 2);
    if (Score <= gameState.maxScore)
      gameState.currScore = Score;
    else
      gameState.currScore = gameState.maxScore;
    gameState.textScore.setText('Score ' + gameState.currScore);
  } // updateScore()

  scoreSetting() {
    //This handles the color of the text and the weather according to the score obtained
    if (gameState.currScore < gameState.maxScore * (1 / 4)){
      this.setWeather('afternoon');
      gameState.textScore.setColor('#fffff');
    }
    else if (gameState.currScore >= gameState.maxScore * (1 / 4) && gameState.currScore < gameState.maxScore * (1 / 2)) {
      this.setWeather('twilight');
      gameState.textScore.setColor('#ff2121');
    }
    else if (gameState.currScore >= gameState.maxScore * (1 / 2) && gameState.currScore < gameState.maxScore * (3 / 4)) {
      this.setWeather('night');
      gameState.textScore.setColor('#ff2121');
    }
    else{
      this.setWeather('morning');
      gameState.textScore.setColor('#fffff');
    }
  } // scoreSetting()

  objectCenter() {
    //updates the gameobject's center position
    gameState.player.center = {
      x: gameState.player.x + gameState.player.width / 2 * gameState.player.Scale,
      y: gameState.player.y + gameState.player.height / 2 * gameState.player.Scale
    };
    gameState.enemy.center = {
      x: gameState.enemy.x + gameState.enemy.width / 2,
      y: gameState.enemy.y + gameState.enemy.height / 2
    };
    gameState.goal.center = {
      x: gameState.goal.x + gameState.goal.width / 2,
      y: gameState.goal.y + gameState.goal.height / 2
    };
  } // objectCenter()

  playerMovement() {
    //initialize the key input
    let keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    let keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    let keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    let keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //set the velocity of X according to gameState.playerSpeed
    gameState.player.setVelocityX(gameState.playerSpeed);

    //executes only when the player touches the platform
    if (gameState.player.body.touching.down) {
      //gameState.player._onPlatformIndex held the current position of the lane, 0 = upper, 1 = middle, 2 = bottom
      //gameState.player.platformSwitch ensures that the swapping lane is only available when both key is released
      //player were required to press either S or arrow key down to shift down to the lower lane
      if (gameState.cursors.down.isDown || keyS.isDown) {
        // if not on the bottom platform, player switch to bottom platform
        if (gameState.player._onPlatformIndex != 2 && gameState.player.platformSwitch == true) { 
          gameState.enemy.y += 100;
          gameState.player.y += 100;
          gameState.player._onPlatformIndex++;
          gameState.player.platformSwitch = false;
        }
      }
      //player were required to press either W or arrow key up to shift up to the upper lane
      else if (gameState.cursors.up.isDown || keyW.isDown) {
        // if not on the top platform, player switch to upper platform
        if (gameState.player._onPlatformIndex != 0 && gameState.player.platformSwitch == true) { 
          gameState.enemy.y -= 100;
          gameState.player.y -= 100;
          gameState.player._onPlatformIndex--;
          gameState.player.platformSwitch = false;
        }
      }
      //when none of the key above is pressed
      else {
        gameState.player.platformSwitch = true;
      }

      //For jumping to dodge obstacle, this is only available when the player does not reach within the radius of the goal / fire
      if (gameState.player.center.x <= gameState.goal.center.x - gameState.goal.repelRadius) {
        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
          gameState.player.setVelocityY(-250);
        }
      }
      else {
        //Ensures that the player will be set on the middle lane when player reaches within the radius of the goal
        if (gameState.player._onPlatformIndex == 0) {
          gameState.player.y += 100;
          gameState.enemy.y += 100;
          gameState.player._onPlatformIndex++;
        }
        else if (gameState.player._onPlatformIndex == 2) {
          gameState.player.y -= 100;
          gameState.enemy.y -= 100;
          gameState.player._onPlatformIndex--;
        }

        //Stops the player entirely when player reaches the goal
        if (gameState.player.center.x >= gameState.goal.center.x - 25) {
          gameState.player.setVelocityX(0);
        }
        //Slows down the player when the player reaches near the goal
        else if (gameState.player.center.x >= gameState.goal.center.x - gameState.goal.repelRadius / 3) {
          gameState.player.setVelocityX(100);
        }
      }

      //Sets the player animations as running
      gameState.player.anims.play('run', true);
    }
    else {
      //gameState.player.anims.play('jump', true);
    }
  } // playerMovement()

  enemyMovement() {
    //The enemy will always runs at maximum speed.
    //But stops entirely when the enemy reaches the repel radius of the goal
    //Enemy animations will be set to idle
    if (gameState.enemy.body.touching.down &&
      gameState.enemy.center.x <= gameState.goal.center.x - gameState.goal.repelRadius
    )
      gameState.enemy.setVelocityX(gameState.enemySpeed)
    else {
      gameState.enemy.setVelocityX(0);
      gameState.enemy.anims.play('enemyIdle', true);
    }
  } // enemyMovement()

  outOfBound() {
    //Puts up the camera shaking effects, when either the enemy or the player falls out of the bound.
    if (gameState.player.y > gameState.bg3.height) {      
      this.cameras.main.shake(240,   // duration - in milliseconds
        .01,   // intensity.
        false, // force - force the shake effect to start immediately, even if already running.
        function (camera, progress) {
          if (progress > .9) {
            // TASK : call appropriate function to restart the current level
            this.scene.restart();
          }
        }
      );
    }
    if (gameState.enemy.y > gameState.bg3.height) {
      gameState.enemy.destroy();
    }
  }

  collisionHandler() {
    //if player collide with tree
    if (gameState.treeCollider.active) {
      //if the referenced current collider is not null
      if (gameState.treeCollider.currCollider != null) {
        //if current collider is the previous collider
        if (gameState.treeCollider.currCollider == gameState.treeCollider.prevCollider) {
          //No output so far, to be developed if required
        }
        else {
          //ensure that the function collider only activate once for the following tree
          if (!gameState.treeCollider.functionActivated) {
            //keep track of the speed before colliding with the tree
            //keep track of the player's lane
            //then set the player speed at 0 to stop the advancement
            //set the tree collider as activated
            gameState.treeCollider.temp_playerSpeed = gameState.playerSpeed;
            gameState.treeCollider.tempPlatformIndex = gameState.player._onPlatformIndex;
            gameState.playerSpeed = 0;
            gameState.treeCollider.functionActivated = true;
          }
          else {
            //if the player switch the lane
            if (gameState.player._onPlatformIndex != gameState.treeCollider.tempPlatformIndex) {
              // restores the player's speed 
              // reset the tree collider
              gameState.playerSpeed = gameState.treeCollider.temp_playerSpeed;
              gameState.treeCollider.active = false;
              gameState.treeCollider.functionActivated = false;
            }
          }
        }
      }
    }
    else {
      // the current collider will be set as previous collider in gameState.treeCollider when the player stops colliding
      if (gameState.treeCollider.currCollider != null) {
        gameState.treeCollider.prevCollider = gameState.treeCollider.currCollider;
        gameState.treeCollider.currCollider = null;
      }
    }

    //if player collide with bush
    if (gameState.bushCollider.active) {
      //if the referenced current collider is not null
      if (gameState.bushCollider.currCollider != null) {
        //if current collider is the previous collider
        if (gameState.bushCollider.currCollider == gameState.bushCollider.prevCollider) {
          //No output so far, to be developed if required
        }
        else {
          //ensure that the function collider only activate once for the following bush
          if (!gameState.bushCollider.functionActivated) {
            //record the time when player collide with the bush
            //then increment the bush collider's speed with 5 and enable the time to stack when another bush is collided
            //reduce the player's speed
            //set the tree collider as activated
            gameState.bushCollider.activatedTime = gameState.elapsedTime;
            gameState.bushCollider.timeReset += 5;
            gameState.playerSpeed -= 20;
            gameState.bushCollider.functionActivated = true;
          }
          else {
            //if the elapsed time is greater than the time which should reset the speed
            if (gameState.elapsedTime >= gameState.bushCollider.activatedTime + gameState.bushCollider.timeReset) {
              //ensure that the timeReset is cleared
              //set the player speed to maximum speed available
              //then reset the bush collider
              gameState.bushCollider.timeReset = 0;
              gameState.playerSpeed = gameState.maxSpeed;
              gameState.bushCollider.active = false;
              gameState.bushCollider.functionActivated = false;
            }
          }
        }
      }
    }
    else {
      // the current collider will be set as previous collider in gameState.bushCollider when the player stops colliding
      if (gameState.bushCollider.currCollider != null) {
        gameState.bushCollider.prevCollider = gameState.bushCollider.currCollider;
        gameState.bushCollider.currCollider = null;
      }
    }

  } // collisionHandler()
} // class Level