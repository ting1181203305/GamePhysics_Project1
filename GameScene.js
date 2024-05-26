
class GameScene extends Phaser.Scene {
  constructor() {
    super({key: 'GameScene'});
  }

  preload() {
    this.load.image('platform',  'images/platform.png');
    this.load.image('snowflake', 'images/snowflake.png');
    this.load.image('bg1',       'images/mountain.png');
    this.load.image('bg2',       'images/trees.png');
    this.load.image('bg3',       'images/snowdunes.png');
    this.load.image('bush1',     'images/snowy_bush_1.png');
    this.load.image('bush2',     'images/snowy_bush_2.png');
    this.load.image('pineTree',  'images/winter_pinetree_1.png')

    this.load.spritesheet('campfire', 'images/campfire.png',     { frameWidth: 32, frameHeight: 32} );
    this.load.spritesheet('doggy',    'images/doggy.png',        { frameWidth: 160, frameHeight: 160} );
    this.load.spritesheet('wolf',     'images/wolf.png',         { frameWidth: 48, frameHeight: 48} );
  }

  create() {
    this.initState();
    this.createStars();
    this.createParallaxBackgrounds();
    this.createAnimations();
    this.createSnow();
    this.createPlayer();
    this.createEnemy();
    this.levelSetup();
    this.sceneGUI();
    this.initCamera();
    this.setCollider();
    this.objectOverlap();
    
    this.anims.pauseAll();
  } // create()

  initState(){
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.active = false;
    gameState.maxSpeed = 240;
    gameState.enemySpeed = gameState.maxSpeed;
    gameState.playerSpeed = gameState.maxSpeed;
    gameState.score = 0;
    gameState.maxScore = 10000;
    gameState.bushSpawnRate = 0.6;
    gameState.treeSpawnRate = 0.2;
  } //initState()

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

  createParallaxBackgrounds() {
    const game_width = parseFloat(2*config.width + gameState.maxScore);
    gameState.width = game_width;
    const window_width = config.width

    gameState.bgColor = this.add.rectangle( 0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);

    gameState.bg1 = this.add.image(0, 0, 'bg1');
    gameState.bg2 = this.add.tileSprite(0, 0, game_width, this.textures.get('bg2').getSourceImage().height, 'bg2');
    gameState.bg3 = this.add.tileSprite(0, 0, game_width, this.textures.get('bg3').getSourceImage().height, 'bg3');

    gameState.bg1.setOrigin(0, 0);
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);

    const bg1_width = gameState.bg1.getBounds().width
    const bg2_width = gameState.bg2.getBounds().width
    const bg3_width = gameState.bg3.getBounds().width

    // setScrollFactor: Refer to https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.ScrollFactor.html
    // A value of 1 : it will move exactly in sync with a camera.
    // A value of 0 : it will not move at all, even if the camera moves. 
    // Other values : control the degree to which the camera movement is mapped to the Game Object.

    // background colour - will not move as camera moves
    gameState.bgColor.setScrollFactor(0);

    // mountain
    // TASK : fix this so that the mountain still visible at the end of the level
    // Hint : the scrolling factor should be a ratio of the width of the mountain over
    //        the width of the snowdunes (i.e. game_width), by considering the window_width
    //gameState.bg1.setScrollFactor(0.8);
    gameState.bg1.setScrollFactor((bg1_width - window_width) / (game_width - window_width));

    // trees
    // TASK : fix this so that the trees still visible at the end of the level
    // Hint : the scrolling factor should be a ratio of the width of the trees over
    //        the width of the snowdunes (i.e. game_width), by considering the window_width
    //gameState.bg2.setScrollFactor(0.9);
    gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));

    gameState.bg3.setScrollFactor((bg2_width - window_width) / (game_width - window_width));

  } // createParallaxBackgrounds()

  createAnimations() {
    this.anims.create( {
                        key: 'run',
                        frames: this.anims.generateFrameNumbers( 'doggy', { frames: [ 8, 9, 10, 11 ] } ),
                        frameRate: 10,
                        repeat: -1
                       } );

    this.anims.create( {
                        key: 'idle',
                        frames: this.anims.generateFrameNumbers( 'doggy', { frames: [ 0, 2 ] } ),
                        frameRate: 10,
                        repeat: -1
                       } );

    this.anims.create( {
                        key: 'jump',
                        frames: this.anims.generateFrameNumbers( 'doggy', { frames: [ 14, 12 ] } ),
                        frameRate: 10,
                        repeat: -1
                       } );
                       
    this.anims.create( {
                        key: 'enemyidle',
                        frames: this.anims.generateFrameNumbers( 'wolf', { frames: [ 9, 11 ] } ),
                        frameRate: 10,
                        repeat: -1
                      } );

    this.anims.create( {
                        key: 'enemyRun',
                        frames: this.anims.generateFrameNumbers( 'wolf', { frames: [ 8, 9, 10, 11 ] } ),
                        frameRate: 10,
                        repeat: -1
                       } );

    this.anims.create( {
                        key: 'fire',
                        frames: this.anims.generateFrameNumbers('campfire'),
                        frameRate: 10,
                        repeat: -1
                       } )
  } // createAnimations()

  createSnow() {
    gameState.particles = this.add.particles('snowflake');

    gameState.emitter = gameState.particles.createEmitter( {
                                                            x: { min: 0, max: config.width * 2 },
                                                            y: -5,
                                                            lifespan: 2000,
                                                            speedX: { min:-5,   max: -200 },
                                                            speedY: { min: 200, max: 400 },
                                                            scale: { start: 0.6, end: 0 },
                                                            quantity: 10,
                                                            blendMode: 'ADD'
                                                           }
                                                         )

    gameState.emitter.setScrollFactor(0);
  } // createSnow()

  setWeather(weather) {

    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'bgColor': 0xF8c3aC,
        'snow':  1,
        'wind':  20,
      },

      'afternoon': {
        'color': 0xffffff,
        'bgColor': 0x0571FF,
        'snow':  1,
        'wind': 80,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow':  10,
        'wind': 200,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow':  0,
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
      let platformWidth = this.textures.get('platform').getSourceImage().width;
      let tempIndex = 0;
      gameState.platformIndex = gameState.width / platformWidth;
      if(gameState.platformIndex % 1 != 0) gameState.platformIndex = parseInt(gameState.platformIndex) + 1;

      let bushScale = 0.25;
      let treeScale = 0.2;

      while(tempIndex <= gameState.platformIndex) {
        let random;
        let randomPlacement;

        let platform = this.physics.add.staticGroup().create(
          (platformWidth * tempIndex),  
          layerY, 
          'platform'
        ).setScale(1,0.5).setOrigin(0, 0.5).refreshBody();
        gameState.platforms.add(platform);

        if(tempIndex > 3 && tempIndex <= gameState.platformIndex - 2){
          random = Phaser.Math.FloatBetween(0,1);
          randomPlacement = Phaser.Math.FloatBetween(0,1)
          if(random <= gameState.bushSpawnRate){
            let randomTexture = Phaser.Math.Between(1,2);
            let bushString = 'bush'+randomTexture;
            let bushWidth = this.textures.get(bushString).getSourceImage().width * bushScale;
            let bushHeight = this.textures.get(bushString).getSourceImage().height * bushScale;

            let bush = this.physics.add.sprite(
                ((platformWidth * tempIndex) + (platformWidth - bushWidth) * randomPlacement),
                (layerY - 10 - bushHeight),
                bushString
            ).setScale(bushScale);
            gameState.bushes.add(bush);
          }

          random = Phaser.Math.FloatBetween(0,1);
          randomPlacement = Phaser.Math.FloatBetween(0,1)
          if(random <= gameState.treeSpawnRate){
            let treeWidth = this.textures.get('pineTree').getSourceImage().width * treeScale;
            let treeHeight = this.textures.get('pineTree').getSourceImage().height * treeScale;

            let tree = this.physics.add.sprite(
                ((platformWidth * tempIndex) + (platformWidth - treeWidth) * randomPlacement),
                (layerY - 10 - treeHeight),
                'pineTree'
            ).setScale(treeScale);
            gameState.trees.add(tree);
          }
        }

        tempIndex++;
      };
  } //initPlatform()

  createPlayer(){
    let texture_width = 160;
    let texture_height = 120;
    let scale = 0.25;
    let x = config.width/2;
    let y = 420-(texture_height * scale);
    gameState.player = this.physics.add.sprite(x, y, 'doggy').setSize(texture_width,texture_height);
    gameState.player._onPlatformIndex = 1; // platformIndex to hold current platform index; 0 = top, 1 = mid, 2 = bottom
    gameState.player.platformSwitch = true;
    gameState.player.Scale = scale;
    gameState.player.setScale(scale);
    gameState.player.anims.play('run',true);
  } // createPlayer()

  createEnemy(){
    let texture_width = 30;
    let texture_height = 46;
    let scale = 1;
    let x = gameState.player.x-200;
    let y = gameState.player.y-5;
    gameState.enemy = this.physics.add.sprite(x, y,'wolf').setSize(texture_width,texture_height);
    gameState.enemy.Scale = scale;
    gameState.enemy.setScale(scale);
    gameState.enemy.anims.play('enemyRun',true);
  } // createEnemy()

  createGoal(layerY){
    // Create the campfire at the end of the level
    gameState.goal = this.physics.add.sprite(gameState.width - 40, layerY - this.textures.get('campfire').getSourceImage().height, 'campfire');
    gameState.goal.anims.play('fire', true);
    gameState.goal.repelWidth = 500;
    gameState.goal.repelRadius = gameState.goal.repelWidth/2;
  } //createGoal()

  sceneGUI(){
    gameState.textScore = this.add.text(config.width/2, 10, 'Score '+gameState.score, { color: '#000000' }).setOrigin(0.5,0.5);
    gameState.textStartGame = this.add.text(config.width/2, config.width/2, 'Press Space to Start', { color: '#000000' }).setOrigin(0.5,0.5);
    gameState.textScore.setScrollFactor(0);
  } //sceneGUI()

  initCamera(){
    this.cameras.main.setBounds (0, 0, gameState.width, gameState.bg3.height);
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

  setCollider(){
    gameState.player.setCollideWorldBounds(true);

    this.physics.add.collider(gameState.player, gameState.platforms);
    this.physics.add.collider(gameState.enemy,  gameState.platforms);
    this.physics.add.collider(gameState.bushes, gameState.platforms);
    this.physics.add.collider(gameState.trees, gameState.platforms);
    this.physics.add.collider(gameState.goal,   gameState.platforms);
  } //setCollider()

  objectOverlap(){
    this.physics.add.overlap( gameState.player, gameState.goal,
      function() {
        this.cameras.main.fade( 800,     // duration in milliseconds
                                0, 0, 0, // amount to fade the red, green, blue channels towards
                                false,   // true or false, force the effect to start immediately, even if already running 
                                function(camera, progress) {
                                  if (progress > .9) {
                                    this.scene.stop('GameScene');
                                    this.scene.start('EndScene');
                                  }
                                }
                              );
      },
      null, this
    );
    this.physics.add.overlap(gameState.player,gameState.enemy, 
      function() {
        this.add.text( config.width/2, config.height/2,
          'You have been devoured!\n  Click to play again.',
          {
            fontSize  : 36,
            align     : 'center',
            fontFamily: 'Arial',
            fontStyle : 'strong',
            color     : '#682afa'
          }
        ).setOrigin(0.5,0.5).setScrollFactor(0);

        this.physics.pause();
        gameState.active = false;
        this.anims.pauseAll();
        this.input.on( 'pointerup',
          () => {
            this.scene.restart();
          }
        )
      },
      null, this
    )
                            
    this.physics.add.overlap(gameState.player,gameState.bushes, 
      () => {
        if(gameState.bushes.active)
          gameState.playerSpeed -= 1;
      },
      null, this
    )

    this.physics.add.overlap(gameState.player,gameState.trees, 
      () => {
          gameState.playerSpeed = 0;
      },
      null, this
    )
  } // objectOverlap()
  
  update() {
      if(gameState.active) {
          this.objectCenter();
          this.updateScore();
          this.scoreSetting();
          try {
              this.playerMovement();
              this.enemyMovement();
          } catch (error) {
              console.log("Exception thrown:"+error);
          }
          this.outOfBound();
      }
      else{
        if(Phaser.Input.Keyboard.JustDown(gameState.cursors.space)){
          gameState.active = true;
          gameState.textStartGame.destroy();
          this.anims.resumeAll();
        }
      }
  } // update()

  updateScore(){
      let currScore = parseInt(gameState.player.center.x - config.width/2);
      if(currScore <= gameState.maxScore)
        gameState.score = currScore;
      else
        gameState.score = gameState.maxScore;
      gameState.textScore.setText('Score '+gameState.score);
  } // updateScore()

  scoreSetting(){
    if(gameState.score<gameState.maxScore*(1/4)) 
      this.setWeather('afternoon');
    else if(gameState.score >= gameState.maxScore*(1/4) && gameState.score < gameState.maxScore*(1/2)){
      this.setWeather('twilight');
      gameState.textScore.setColor('#ff2121');
    } 
    else if(gameState.score >= gameState.maxScore*(1/2) && gameState.score < gameState.maxScore*(3/4)){
      this.setWeather('night');
      gameState.textScore.setColor('#ff2121');
    } 
    else 
      this.setWeather('morning');
  } // scoreSetting()

  objectCenter(){
    gameState.player.center = {
      x: gameState.player.x+gameState.player.width/2 * gameState.player.Scale, 
      y: gameState.player.y+gameState.player.height/2 * gameState.player.Scale
    };
    //console.log("position player centerx:"+ gameState.player.centerX+" centerY:"+gameState.player.centerY);
    gameState.enemy.center = {
      x: gameState.enemy.x+gameState.enemy.width/2,
      y: gameState.enemy.y+gameState.enemy.height/2
    };
    gameState.goal.center = {
      x: gameState.goal.x+gameState.goal.width/2, 
      y: gameState.goal.y+gameState.goal.height/2
    };
  } // objectCenter()

  playerMovement(){
    let keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    let keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    let keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    let keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

      if (gameState.player.body.touching.down){
          ////For debugging purpose
          // if (gameState.cursors.right.isDown || keyD.isDown) {
          //   gameState.player.anims.play('run', true);
          //   gameState.player.flipX = false;
          //   gameState.player.setVelocityX(gameState.playerSpeed);
          // } 
          // else if (gameState.cursors.left.isDown || keyA.isDown) {
          //   gameState.player.anims.play('run', true);
          //   gameState.player.flipX = true;
          //   gameState.player.setVelocityX(-gameState.playerSpeed);
          // } 
          // else {
          //   gameState.player.setVelocityX(0);
          //   gameState.player.anims.play('idle', true);
          // }

          ////For Switching platform
          if(gameState.cursors.down.isDown || keyS.isDown){
              if(gameState.player._onPlatformIndex != 2 && gameState.player.platformSwitch == true){ // if not on the bottom platform, player switch to bottom platform
                  gameState.enemy.y += 100;
                  gameState.player.y += 100;
                  gameState.player._onPlatformIndex ++;
                  gameState.player.platformSwitch = false;
              }
          }
          else if(gameState.cursors.up.isDown || keyW.isDown){
              if(gameState.player._onPlatformIndex != 0 && gameState.player.platformSwitch == true){ // if not on the top platform, player switch to upper platform
                  gameState.enemy.y -= 100;
                  gameState.player.y -= 100;
                  gameState.player._onPlatformIndex --;
                  gameState.player.platformSwitch = false;
              }
          }
          else{
            gameState.player.platformSwitch = true;
          }

          //For jumping to dodge obstacle
          if(gameState.player.center.x <= gameState.goal.center.x - gameState.goal.repelRadius) {
              if(Phaser.Input.Keyboard.JustDown(gameState.cursors.space)){
                  gameState.player.setVelocityY(-250);
              }
              else{
                  gameState.player.setVelocityX(gameState.playerSpeed);
              }
          }
          else{
              if(gameState.player._onPlatformIndex == 0){
                gameState.player.y += 100;
                gameState.enemy.y += 100;
                gameState.player._onPlatformIndex ++;
              }
              else if(gameState.player._onPlatformIndex == 2){
                gameState.player.y -= 100;
                gameState.enemy.y -= 100;
                gameState.player._onPlatformIndex --;
              }
              
              if(gameState.player.center.x >= gameState.goal.center.x-25){
                      gameState.player.setVelocityX(0);
              }
              else if(gameState.player.center.x >= gameState.goal.center.x - gameState.goal.repelRadius/3){
                  try {
                    gameState.player.setVelocityX(100);
                    //console.log("Decay:");
                  } catch (error) {
                    console.log("Failed to drop velocity");
                  }
              }
          }
          gameState.player.anims.play('run', true);
      }
      else{
          gameState.player.anims.play('jump', true);
      }
  } // playerMovement()

  enemyMovement(){
      if(gameState.enemy.body.touching.down && 
         gameState.enemy.center.x <= gameState.goal.center.x - gameState.goal.repelRadius
        ) 
        gameState.enemy.setVelocityX(gameState.enemySpeed)
      else{
        gameState.enemy.setVelocityX(0);
        gameState.enemy.anims.play('enemyIdle', true);
      }
  } // enemyMovement()

  outOfBound(){
    if (gameState.player.y > gameState.bg3.height) {
        // Camera Shake Effect
        // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Effects.Shake.html        
        this.cameras.main.shake( 240,   // duration - in milliseconds
                                .01,   // intensity.
                                false, // force - force the shake effect to start immediately, even if already running.
                                function(camera, progress) {
                                  if (progress > .9) {
                                    // TASK : call appropriate function to restart the current level
                                    this.scene.restart(); 
                                  }
                                }
                              );
    }
    if(gameState.enemy.y > gameState.bg3.height){
        gameState.enemy.destroy();
    }
  }
} // class Level