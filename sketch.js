let player1, player2;
let bgImage;
let windowW, windowH;

// 精靈圖配置
const sprites = {
  player1: {
    idle: {
      img: null,
      width: 34.3,
      height: 43,
      frames: 3
    },
    attack: {
      img: null,
      width: 54.5,
      height: 79,
      frames: 12
    },
    jump: {
      img: null,
      width: 58.1,
      height: 50,
      frames: 10
    }
  },
  player2: {
    idle_2: {
      img: null,
      width: 45.7,
      height: 48,
      frames: 4
    },
    attack_2: {
      img: null,
      width: 62.1,
      height: 48,
      frames: 6
    },
    jump_2: {
      img: null,
      width: 72.2,
      height: 43,
      frames: 7
    }
  }
};

function preload() {
  // 載入背景圖片
  bgImage = loadImage('background.png');
  
  // 載入玩家1的圖片
  sprites.player1.idle.img = loadImage('player1/idle.png');
  sprites.player1.attack.img = loadImage('player1/attack.png');
  sprites.player1.jump.img = loadImage('player1/jump.png');
  
  // 載入玩家2的圖片
  sprites.player2.idle_2.img = loadImage('player2/idle_2.png');
  sprites.player2.attack_2.img = loadImage('player2/attack_2.png');
  sprites.player2.jump_2.img = loadImage('player2/jump_2.png');
}

class Fighter {
  constructor(x, y, isPlayer1) {
    this.x = x;
    this.y = y;
    this.isPlayer1 = isPlayer1;
    this.speed = 5;
    this.jumpForce = -20;
    this.gravity = 0.6;
    this.velocityY = 0;
    this.isJumping = false;
    this.isAttacking = false;
    this.currentState = 'idle';
    this.frameIndex = 0;
    this.frameCounter = 0;
    this.frameDelay = 5;
    this.facingRight = isPlayer1;
    
    // 生命值系統
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.damage = 10;
    this.isHit = false;
    
    if (isPlayer1) {
      this.width = sprites.player1.idle.width * 2;
      this.height = sprites.player1.idle.height * 2;
    } else {
      this.width = sprites.player2.idle_2.width * 2;
      this.height = sprites.player2.idle_2.height * 2;
    }
  }

  update() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // 修改地板位置為螢幕高度的 2/3 處
    let floorY = windowH * 0.66;
    
    if (this.y > floorY) {
      this.y = floorY;
      this.velocityY = 0;
      this.isJumping = false;
      if (this.currentState === 'jump') {
        this.currentState = 'idle';
      }
    }
  }

  move(direction) {
    this.x += direction * this.speed;
    if (direction !== 0) {
      this.facingRight = direction > 0;
    }
    this.x = constrain(this.x, 0, windowW - this.width);
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
      this.currentState = 'jump';
    }
  }

  attack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      const originalY = this.y;  // 保存原始Y位置
      this.currentState = 'attack';
      setTimeout(() => {
        this.isAttacking = false;
        this.currentState = 'idle';
        this.y = originalY;  // 恢復原始Y位置
      }, 500);
    }
  }

  takeHit(damage) {
    if (!this.isHit) {
      this.health -= damage;
      this.isHit = true;
      setTimeout(() => {
        this.isHit = false;
      }, 500);
    }
  }

  checkAttackCollision(other) {
    if (this.isAttacking && !other.isHit) {
      let thisLeft = this.facingRight ? this.x : this.x - this.width;
      let thisRight = this.facingRight ? this.x + this.width * 1.5 : this.x + this.width * 0.5;
      let otherLeft = other.x;
      let otherRight = other.x + other.width;

      if (thisRight > otherLeft && 
          thisLeft < otherRight && 
          this.y < other.y + other.height &&
          this.y + this.height > other.y) {
        other.takeHit(this.damage);
      }
    }
  }

  display() {
    // 繪製生命條和數字
    push();
    // 生命條
    fill(255, 0, 0);
    rect(this.x, this.y - 30, this.width, 5);
    fill(0, 255, 0);
    rect(this.x, this.y - 30, (this.health / this.maxHealth) * this.width, 5);
    
    // 生命值數字
    textSize(16);
    textAlign(CENTER);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text(Math.ceil(this.health), this.x + this.width/2, this.y - 35);
    pop();
    
    push();
    
    let currentAnim;
    let yOffset = 0;
    
    if (this.isPlayer1) {
      switch (this.currentState) {
        case 'idle':
          currentAnim = sprites.player1.idle;
          break;
        case 'attack':
          currentAnim = sprites.player1.attack;
          yOffset = -45;  // 調整為-45，讓攻擊位置更高
          break;
        case 'jump':
          currentAnim = sprites.player1.jump;
          yOffset = -10;
          break;
      }
    } else {
      switch (this.currentState) {
        case 'idle':
          currentAnim = sprites.player2.idle_2;
          break;
        case 'attack':
          currentAnim = sprites.player2.attack_2;
          yOffset = -10;
          break;
        case 'jump':
          currentAnim = sprites.player2.jump_2;
          yOffset = -5;
          break;
      }
    }

    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.frameIndex = (this.frameIndex + 1) % currentAnim.frames;
    }

    if (this.isPlayer1) {
      if (!this.facingRight) {
        translate(this.x + currentAnim.width * 2, this.y + yOffset);
        scale(-1, 1);
      } else {
        translate(this.x, this.y + yOffset);
      }
    } else {
      if (this.facingRight) {
        translate(this.x + currentAnim.width * 2, this.y + yOffset);
        scale(-1, 1);
      } else {
        translate(this.x, this.y + yOffset);
      }
    }

    image(
      currentAnim.img,
      0,
      0,
      currentAnim.width * 2,
      currentAnim.height * 2,
      this.frameIndex * currentAnim.width,
      0,
      currentAnim.width,
      currentAnim.height
    );

    pop();
  }
}

function setup() {
  windowW = windowWidth;
  windowH = windowHeight;
  createCanvas(windowW, windowH);
  let baseY = windowH * 0.66;
  player1 = new Fighter(windowW * 0.1, baseY, true);
  player2 = new Fighter(windowW * 0.8, baseY, false);
}

function windowResized() {
  windowW = windowWidth;
  windowH = windowHeight;
  resizeCanvas(windowW, windowH);
  
  // 重新調整玩家位置
  let baseY = windowH * 0.66;
  player1.y = baseY;
  player2.y = baseY;
}

function draw() {
  // 繪製背景
  image(bgImage, 0, 0, windowW, windowH);

  // 繪製標題 "TKUET"
  textSize(72);
  textAlign(CENTER);
  fill(255);
  stroke(0);
  strokeWeight(4);
  text("TKUET", windowW/2, windowH * 0.1);
  
  // 繪製遊戲說明
  textSize(20);
  textAlign(RIGHT);
  strokeWeight(2);
  let instructY = 30;  // 起始Y位置
  let lineSpacing = 25;  // 行距
  
  text("玩家1: WASD移動, F攻擊", windowW - 20, instructY);
  text("玩家2: 方向鍵移動, 數字鍵5攻擊", windowW - 20, instructY + lineSpacing);
  text("生命值: 100", windowW - 20, instructY + lineSpacing * 2);
  text("攻擊傷害: 10", windowW - 20, instructY + lineSpacing * 3);
  
  if (keyIsDown(65)) player1.move(-1);  // A
  if (keyIsDown(68)) player1.move(1);   // D
  
  if (keyIsDown(LEFT_ARROW)) player2.move(-1);
  if (keyIsDown(RIGHT_ARROW)) player2.move(1);

  player1.update();
  player2.update();
  
  // 檢查攻擊碰撞
  player1.checkAttackCollision(player2);
  player2.checkAttackCollision(player1);
  
  player1.display();
  player2.display();

  // 檢查遊戲結束
  if (player1.health <= 0 || player2.health <= 0) {
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    if (player1.health <= 0) {
      text("Player 2 Wins!", windowW/2, windowH/2);
    } else {
      text("Player 1 Wins!", windowW/2, windowH/2);
    }
    noLoop();
  }
}

function keyPressed() {
  if (keyCode === 87) player1.jump();    // W
  if (keyCode === 70) player1.attack();  // F

  if (keyCode === UP_ARROW) player2.jump();
  if (keyCode === 101) player2.attack(); // 數字鍵盤5
}