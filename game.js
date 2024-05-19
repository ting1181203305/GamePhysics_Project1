const gameState = {
  speed: 240,
  ups: 380,
  score: 0,
};

class Level extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.levelKey = key
    this.nextLevel = {
      'Level1': 'Credits',
    }
  }



  preload() {
    this.load.image('platform',  'images/platform.png');
    this.load.image('snowflake', 'images/snowflake.png');
    this.load.image('bg1',       'images/mountain.png');
    this.load.image('bg2',       'images/trees.png');
    this.load.image('bg3',       'images/snowdunes.png');

    this.load.spritesheet('campfire', 'images/campfire.png', { frameWidth: 32, frameHeight: 32} );
    this.load.spritesheet('doggy',    'images/doggy.png',    { frameWidth: 160, frameHeight: 160} );
    this.load.spritesheet('wolf',    'images/wolf.png',    { frameWidth: 48, frameHeight: 48} );
  }

  create() {
    gameState.active = true

    this.createStars();
    this.createParallaxBackgrounds();
    this.createAnimations();
    this.createSnow();
    this.createPlayer();
    this.createEnemy();
    gameState.platforms = this.physics.add.staticGroup();
    this.levelSetup();
    this.sceneGUI();
    this.initCamera();
    this.setCollider();
    this.objectOverlap();
    
    gameState.cursors = this.input.keyboard.createCursorKeys();
  } // create()

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
    gameState.bgColor = this.add.rectangle( 0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);

    gameState.bg1 = this.add.image(0, 0, 'bg1');
    gameState.bg2 = this.add.image(0, 0, 'bg2');
    gameState.bg3 = this.add.image(0, 0, 'bg3');

    gameState.bg1.setOrigin(0, 0);
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);

    const game_width = parseFloat(gameState.bg3.getBounds().width)
    gameState.width = game_width;
    const window_width = config.width

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

    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }

    return
  } // setWeather(weather)

  levelSetup() {
    for (const [xIndex, yIndex] of this.heights.entries()) {
      this.createPlatform(xIndex, yIndex);
    } 
    
    // Create the campfire at the end of the level
    gameState.goal = this.physics.add.sprite(gameState.width - 40, 100, 'campfire');
    gameState.goal.anims.play('fire', true);
    gameState.goal.repelWidth = 500;
    gameState.goal.repelRadius = gameState.goal.repelWidth/2;

    this.physics.add.overlap( gameState.player, gameState.goal,
                              function() {
                                this.cameras.main.fade( 800,     // duration in milliseconds
                                                        0, 0, 0, // amount to fade the red, green, blue channels towards
                                                        false,   // true or false, force the effect to start immediately, even if already running 
                                                        function(camera, progress) {
                                                          if (progress > .9) {
                                                            this.scene.stop(  this.levelKey );
                                                            this.scene.start( this.nextLevel[this.levelKey] );
                                                          }
                                                        }
                                                      );
                              },
                              null, this
                            );

    this.setWeather(this.weather);
  } // levelSetup()

  createPlatform(xIndex, yIndex) {
    // Creates a platform evenly spaced along the two indices.
    // If either is not a number it won't make a platform
      if (typeof yIndex === 'number' && typeof xIndex === 'number') {
        gameState.platforms.create((220 * xIndex),  yIndex * 70, 'platform').setOrigin(0, 0.5).refreshBody();
      }
  } //createPlatform(xIndex, yIndex)

  createPlayer(){
    gameState.player    = this.physics.add.sprite(125, 110, 'doggy').setSize(160,130);
    gameState.player.Scale = 0.25;
    gameState.player.setScale(gameState.player.Scale);
  } // createPlayer()

  createEnemy(){
    gameState.enemy = this.physics.add.sprite(gameState.player.x-100,gameState.player.y,'wolf').setSize(30,46);
    gameState.enemy.anims.play('enemyRun',true);
  } // createEnemy()

  sceneGUI(){
    gameState.score = 0;
    gameState.scoreText = this.add.text(config.width/2, 10, 'Score '+gameState.score, { color: '#000000' }).setOrigin(0.5,0.5);
    gameState.scoreText.setScrollFactor(0);
  } //sceneGUI()

  initCamera(){
    this.cameras.main.setBounds (0, 0, gameState.bg3.width, gameState.bg3.height);
    this.physics.world.setBounds(0, 0, gameState.width,     gameState.bg3.height + gameState.player.height);

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
    this.physics.add.collider(gameState.goal,   gameState.platforms);
  } //setCollider()

  objectOverlap(){
    this.physics.add.overlap(gameState.player,gameState.enemy, () => {
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
                                    this.anims.resumeAll();
                                    this.scene.restart();
                                  }
                                )
                            })
  } // objectOverlap()
  
  update() {
    if(gameState.active) {

      this.updateScore();
      this.scoreSetting();
      this.objectCenter();
      try {
        this.playerMovement();
        this.enemyMovement();
      } catch (error) {
        console.log("Exception thrown:"+error);
      }

      if (gameState.player.y > gameState.bg3.height) {

        // Camera Shake Effect
        // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Effects.Shake.html        
        this.cameras.main.shake( 240,   // duration - in milliseconds
                                 .01,   // intensity.
                                 false, // force - force the shake effect to start immediately, even if already running.
                                 function(camera, progress) {
                                   if (progress > .9) {
                                     // TASK : call appropriate function to restart the current level
                                     this.create(); 
                                   }
                                 }
                               );
      }
      if(gameState.enemy.y > gameState.bg3.height){
        gameState.enemy.destroy();
      }
    }
  } // update()

  updateScore(){
    gameState.score +=1;
    gameState.scoreText.setText('Score '+gameState.score);
  } // updateScore()

  scoreSetting(){
    if(gameState.score<2500) this.setWeather('afternoon');
    else if(gameState.score >= 2500 && gameState.score < 5000){
      this.setWeather('twilight');
      gameState.scoreText.setColor('#ff2121');
    } 
    else if(gameState.score >= 5000 && gameState.score < 7500){
      this.setWeather('night');
      gameState.scoreText.setColor('#ff2121');
    } 
    else if(gameState.score >= 7500){
      this.setWeather('morning');
    } 
  } // scoreSetting()

  objectCenter(){
    gameState.player.centerX = gameState.player.x+gameState.player.width/2 * gameState.player.Scale;
    gameState.player.centerY = gameState.player.y+gameState.player.height/2 * gameState.player.Scale;
    console.log("position player centerx:"+ gameState.player.centerX+" centerY:"+gameState.player.centerY);
    gameState.enemy.centerX = gameState.enemy.x+gameState.enemy.width/2;
    gameState.enemy.centerY = gameState.enemy.y+gameState.enemy.heights/2;
    gameState.goal.centerX = gameState.goal.x+gameState.goal.width/2;
    gameState.goal.centerY = gameState.goal.y+gameState.goal.heights/2;
  } // objectCenter()

  playerMovement(){
    /*let keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    let keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    let keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    let keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      if (gameState.cursors.right.isDown || keyD.isDown) {
        gameState.player.flipX = false;
        gameState.player.setVelocityX(gameState.speed);
        gameState.player.anims.play('run', true);
      } else if (gameState.cursors.left.isDown || keyA.isDown) {
        gameState.player.flipX = true;
        gameState.player.setVelocityX(-gameState.speed);
        gameState.player.anims.play('run', true);
      } else {
        gameState.player.setVelocityX(0);
        gameState.player.anims.play('idle', true);
      }*/
      if (gameState.player.body.touching.down){
              //|| keyW.isDown
          if(gameState.player.centerX <= gameState.goal.centerX - gameState.goal.repelRadius) {
              if(Phaser.Input.Keyboard.JustDown(gameState.cursors.space)){
                  gameState.player.anims.play('jump', true);
                  gameState.player.setVelocityY(-250);
              }
              else{
                gameState.player.setVelocityX(gameState.speed);
                gameState.player.anims.play('run', true);
              }
          }
          else{
              if(gameState.player.centerX >= gameState.goal.centerX-25){
                      gameState.player.setVelocityX(0);
              }
              else if(gameState.player.centerX >= gameState.goal.centerX - gameState.goal.repelRadius/3){
                  try {
                    gameState.player.setVelocityX(100);
                    //console.log("Decay:");
                  } catch (error) {
                    console.log("Failed to drop velocity");
                  }
              }
          }
      }
      else{
        gameState.player.anims.play('jump', true);
      }
  } // playerMovement()

  enemyMovement(){
      if(gameState.enemy.body.touching.down && 
         gameState.enemy.centerX <= gameState.goal.centerX - gameState.goal.repelRadius
        ) 
        gameState.enemy.setVelocityX(gameState.speed)
      else
        gameState.enemy.setVelocityX(0);
  } // enemyMovement()
} // class Level

// heights are the heights of the platforms
class Level1 extends Level {
  constructor() {
    super('Level1')
    this.heights = [6, 6, 6, 6, 6, 6, 6, 6, 6];
    this.weather = 'afternoon';
  }
}

class Credits extends Phaser.Scene {
  constructor() {
    super('Credits')
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
  scene: [Level1, Credits]
};

const game = new Phaser.Game(config);
