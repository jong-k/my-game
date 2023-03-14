window.addEventListener("load", function () {
  // canvas setup
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 700;
  canvas.height = 500;

  // 유저 인풋에 따라 플레이어 움직임을 처리하는 클래스
  class InputHandler {
    game: Game;

    constructor(game: Game) {
      this.game = game;

      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          !this.game.keys.includes(e.key)
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          // 스페이스바 입력
          this.game.player.shootTop();
        } else if (e.key === "d") {
          // 디버그 모드
          this.game.debug = !this.game.debug;
        }
      });
      // 키를 떼면, Game 클래스의 keys 배열에서 제거
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.includes(e.key)) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }
  // 사운드 조절
  class SoundController {
    powerUpSound: HTMLMediaElement;
    powerDownSound: HTMLMediaElement;
    explosionSound: HTMLMediaElement;
    shotSound: HTMLMediaElement;
    hitSound: HTMLMediaElement;
    shieldSound: HTMLMediaElement;

    constructor() {
      this.powerUpSound = document.getElementById(
        "powerup",
      ) as HTMLMediaElement;
      this.powerDownSound = document.getElementById(
        "powerdown",
      ) as HTMLMediaElement;
      this.explosionSound = document.getElementById(
        "explosion",
      ) as HTMLMediaElement;
      this.shotSound = document.getElementById("shot") as HTMLMediaElement;
      this.hitSound = document.getElementById("hit") as HTMLMediaElement;
      this.shieldSound = document.getElementById(
        "shieldSound",
      ) as HTMLMediaElement;
    }

    powerUp() {
      // 반복 재생을 위해 play 시간을 0으로 설정
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.play();
    }

    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.play();
    }

    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.play();
    }

    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.play();
    }

    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }

    shield() {
      this.shieldSound.currentTime = 0;
      this.shieldSound.play();
    }
  }
  // 보호막 발동
  class Shield {
    game: Game;
    width: number;
    height: number;
    frameX: number;
    maxFrame: number;
    image: HTMLImageElement;
    fps: number;
    timer: number;
    interval: number;

    constructor(game: Game) {
      this.game = game;
      this.width = this.game.player.width;
      this.height = this.game.player.height;
      this.frameX = 0;
      this.maxFrame = 24;
      this.image = document.getElementById("shield") as HTMLImageElement;
      this.fps = 30;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }

    update(deltaTime: number) {
      if (this.frameX <= this.maxFrame) {
        if (this.timer > this.interval) {
          this.frameX++;
          this.timer = 0;
        } else {
          this.timer++;
        }
      }
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.game.player.x,
        this.game.player.y,
        this.width,
        this.height,
      );
    }

    // shield 애니메이션이 아직 안끝났는데 다시 발생할 수도 있기 때문에 일단 frameX 0에서 시작
    reset() {
      this.frameX = 0;
      this.game.sound.shield();
    }
  }

  // 플레이어가 발사하는 투사체
  class Projectile {
    game: Game;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    markedForDeletion: boolean;
    image: HTMLImageElement;
    frameX: number;
    maxFrame: number;
    fps: number;
    timer: number;
    interval: number;

    constructor(game: Game, x: number, y: number) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 36.25;
      this.height = 20;
      this.speed = Math.random() * 0.2 + 2.8;
      this.markedForDeletion = false; // 투사체가 멀어져서 삭제 가능한 상태인지 여부
      this.image = document.getElementById("fireball") as HTMLImageElement;
      this.frameX = 0;
      this.maxFrame = 3;
      this.fps = 20;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }

    update(deltaTime: number) {
      this.x += this.speed;
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      // width 80% 넘어가면 화면에서 사라짐
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }
  }

  // 적의 피격 효과로 생기는 파편을 담당하는 클래스
  class Particle {
    game: Game;
    x: number;
    y: number;
    image: HTMLImageElement;
    frameX: number;
    frameY: number;
    spriteSize: number;
    sizeModifier: number;
    size: number;
    speedX: number;
    speedY: number;
    gravity: number;
    markedForDeletion: boolean;
    angle: number;
    velocityOfAngle: number;
    bounced: number;
    bottomBounceBoundary: number;

    constructor(game: Game, x: number, y: number) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears") as HTMLImageElement;
      // 3 * 3 이미지 시트에서 랜덤한 이미지를 골라 사용
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      // 파편의 사이즈는 랜덤하게 생성
      this.spriteSize = 50;
      this.sizeModifier = +(Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      // -3 ~ 2 // x 축 앞, 뒤로 움직일 수 있음
      this.speedX = Math.random() * 6 - 3;
      // y축에서는 위로만 이동
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      // -0.1 ~ 0.1
      this.velocityOfAngle = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      // 바운스 지점을 그라운드 특정 영역 사이에서 랜덤하게 지정
      this.bottomBounceBoundary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.velocityOfAngle;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size)
        this.markedForDeletion = true;
      // 2번 튕기면 사라짐
      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced++;
        this.speedY *= -0.7;
      }
    }

    draw(context: CanvasRenderingContext2D) {
      // this.x, this.y 를 수정할 때는 save, restore를 사용하여 다음 인스턴스에 영향이 없도록 해야함
      context.save();
      context.translate(this.x, this.y);
      // angle은 velocityOfAngle에 의해 계속 변화
      context.rotate(this.angle);
      // translate를 통해 이미 x, y가 이동되어 있기 때문에,
      // 밑에서 0, 0을 넣어주면 됨
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size,
      );
      context.restore();
    }
  }

  // 메인 플레이어 담당
  class Player {
    game: Game;
    width: number;
    height: number;
    x: number;
    y: number;
    frameX: number;
    frameY: number;
    maxFrame: number;
    speedY: number;
    maxSpeed: number;
    projectiles: Projectile[];
    image: HTMLImageElement;
    powerUp: boolean;
    powerUpTimer: number;
    powerUpLimit: number;

    constructor(game: Game) {
      this.game = game;
      this.width = 120; // player의 외형
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37; // player.png는 37장 이미지 갖고 잇음
      this.speedY = 0; // player의 속도. 음수이면 위로 움직임
      this.maxSpeed = 3;
      this.projectiles = [];
      this.image = document.getElementById("player") as HTMLImageElement;
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }

    update(deltaTime: number) {
      // 입력받은 키에 따라 player 위치 (x, y) 수정
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY; // 실제로 player 움직이게 하는 부분
      // vertical boundaries
      // 플레이어 하반신이 화면 아래쪽으로 치우쳐 off-screen 되면 억제
      if (this.y > this.game.height - this.height * 0.5)
        this.y = this.game.height - this.height * 0.5;
      // 플레이어 상반신이 화면 위쪽으로 치우쳐 off-screen 되면 억제
      else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;

      // 투사체 배열의 개별 투사체 업데이트
      this.projectiles.forEach((projectile) => {
        projectile.update(deltaTime);
      });
      // 투사체 배열에서 markedForDeletion false만 남김
      // true인 것은 배열에서 빠져서 렌더링 안됨
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion,
      );
      // sprite animation
      // 이미지 시트(살짝 다르고 크게는 같은 이미지 여러장이 일렬로 늘어선 이미지)를 사용하여,
      // 일정 부분씩 잘라서 연속적으로 렌더링하면서 애니메이션 효과를 줌
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      // power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0; // 일반 상태 이미지
          this.game.sound.powerDown();
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1; // power up 되면 이미지가 변화하고
          this.game.ammo += 0.1; // 총알도 더 빨리 참
        }
      }
    }

    draw(context: CanvasRenderingContext2D) {
      // fillRect -> strokeRect : 투명한 박스
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }

    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30),
        );
        this.game.ammo--;
        this.game.sound.shot();
      }
      if (this.powerUp) this.shootBottom();
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 175),
        );
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo) {
        this.game.ammo = this.game.maxAmmo;
      }
      this.game.sound.powerUp();
    }
  }

  // 적들의 움직임 등을 담당
  abstract class Enemy {
    game: Game;
    x: number;
    speedX: number;
    markedForDeletion: boolean;
    frameX: number;
    frameY: number;
    maxFrame: number;
    abstract width: number;
    abstract height: number;
    abstract y: number;
    abstract image: HTMLImageElement;
    abstract score: number;
    abstract lives: number;
    abstract type: string;

    constructor(game: Game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5; // 적들은 오른쪽 끝에서 다가오는 속도
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }

    update() {
      this.x += this.speedX;
      // canvas 왼쪽끝을 지나쳐서 안보이게 되면 제거됨
      if (this.x + this.width < 0) this.markedForDeletion = true;
      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context: CanvasRenderingContext2D) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height,
      );
      if (this.game.debug) {
        context.font = "20px Helvetica";
        context.fillText(String(this.lives), this.x, this.y);
      }
    }
  }

  class Angler1 extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1") as HTMLImageElement;
      this.frameY = Math.floor(Math.random() * 3); // 0~2 사이에서 발생하므로, 이미지 시트에서 0~2 row 에서 하나 랜덤하게 골라짐
      this.lives = 5;
      this.score = this.lives;
      this.type = "";
    }
  }

  class Angler2 extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2") as HTMLImageElement;
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 6;
      this.score = this.lives;
      this.type = "";
    }
  }

  class LuckyFish extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("lucky") as HTMLImageElement;
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 5;
      this.score = 15;
      this.type = "lucky";
    }
  }

  class HiveWhale extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("hivewhale") as HTMLImageElement;
      this.frameY = 0;
      this.lives = 20;
      this.score = this.lives;
      this.type = "hiveWhale";
      // speedX 범위 : -1.4 ~ -0.2
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class Drone extends Enemy {
    width: number;
    height: number;
    x: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;
    // hive whale 이 파괴된 지점 x, y에서 drone이 생성되기 때문에
    // x, y 도 전달해야 함
    constructor(game: Game, x: number, y: number) {
      super(game);
      this.width = 115;
      this.height = 95;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("drone") as HTMLImageElement;
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.score = this.lives;
      this.type = "drone";
      // speedX 범위 : -4.7 ~ -0.5
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }

  class BulbWhale extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 270;
      this.height = 219;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("bulbwhale") as HTMLImageElement;
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 20;
      this.score = this.lives;
      this.type = "bulbwhale";
      // speedX 범위 : -1.4 ~ -0.2
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class MoonFish extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 227;
      this.height = 240;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("moonfish") as HTMLImageElement;
      this.frameY = 0;
      this.lives = 10;
      this.score = this.lives;
      this.type = "moonfish";
      // speedX 범위 : -3.2 ~ -2
      this.speedX = Math.random() * -1.2 - 2;
    }
  }

  class Stalker extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 243;
      this.height = 123;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("stalker") as HTMLImageElement;
      this.frameY = 0;
      this.lives = 10;
      this.score = this.lives;
      this.type = "stalker";
      // speedX 범위 : -2 ~ -0.8
      this.speedX = Math.random() * -1.2 - 0.8;
    }
  }

  class Razorfin extends Enemy {
    width: number;
    height: number;
    y: number;
    image: HTMLImageElement;
    frameY: number;
    lives: number;
    score: number;
    type: string;

    constructor(game: Game) {
      super(game);
      this.width = 187;
      this.height = 149;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("razorfin") as HTMLImageElement;
      this.frameY = 0;
      this.lives = 7;
      this.score = this.lives;
      this.type = "razorfin";
      // speedX 범위 : -2 ~ -0.8
      this.speedX = Math.random() * -1.2 - 0.8;
    }
  }

  // 부드러운 스크롤 등 각 레이어 처리를 담당
  class Layer {
    game: Game;
    image: CanvasImageSource;
    speedModifier: number;
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(game: Game, image: CanvasImageSource, speedModifier: number) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      // 배경 이미지가 (0, 0) 을 지나서 왼쪽으로 계속 가다가(음수), 이미지 width를 지나면 다시 0으로 초기화
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context: CanvasRenderingContext2D) {
      // 이미지를 2개를 연달아 배치하여, 첫 이미지 끝나고 잠깐 빈 화면이 보이는 것을 방지
      // 2번째 이미지는 한 캔버스 크기만 보이게 됨
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  // 모든 레이어를 모음
  class Background {
    game: Game;
    image1: HTMLImageElement;
    image2: HTMLImageElement;
    image3: HTMLImageElement;
    image4: HTMLImageElement;
    layer1: Layer;
    layer2: Layer;
    layer3: Layer;
    layer4: Layer;
    layers: Layer[];

    constructor(game: Game) {
      this.game = game;
      this.image1 = document.getElementById("layer1") as HTMLImageElement;
      this.image2 = document.getElementById("layer2") as HTMLImageElement;
      this.image3 = document.getElementById("layer3") as HTMLImageElement;
      this.image4 = document.getElementById("layer4") as HTMLImageElement;
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      // layer4는 가장 앞에 렌더링되어야 하기 때문에 따로 빼줌
      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update() {
      this.layers.forEach((layer) => {
        layer.update();
      });
    }

    draw(context: CanvasRenderingContext2D) {
      this.layers.forEach((layer) => {
        layer.draw(context);
      });
    }
  }

  // 폭발 효과
  abstract class Explosion {
    game: Game;
    x: number;
    y: number;
    abstract image: HTMLImageElement;
    frameX: number;
    spriteWidth: number;
    spriteHeight: number;
    width: number;
    height: number;
    fps: number;
    timer: number;
    interval: number;
    markedForDeletion: boolean;
    maxFrame: number;

    constructor(game: Game, x: number, y: number) {
      this.game = game;
      this.frameX = 0;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      // 게임 전체의 fps와 폭발 효과의 fps를 분리
      this.fps = 30;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8;
    }

    update(deltaTime: number) {
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }
  }

  // 연기 효과
  class SmokeExplosion extends Explosion {
    image: HTMLImageElement;

    constructor(game: Game, x: number, y: number) {
      super(game, x, y);
      this.image = document.getElementById(
        "smokeExplosion",
      ) as HTMLImageElement;
    }
  }

  // 화염 효과
  class FireExplosion extends Explosion {
    image: HTMLImageElement;

    constructor(game: Game, x: number, y: number) {
      super(game, x, y);
      this.image = document.getElementById("fireExplosion") as HTMLImageElement;
    }
  }

  // 타이머, 글로벌 UI
  class UI {
    game: Game;
    fontSize: number;
    fontFamily: string;
    color: "white";

    constructor(game: Game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
      this.color = "white";
    }

    draw(context: CanvasRenderingContext2D) {
      // 기본값을 저장하고 변형한 것을 렌더링하다가
      context.save();
      context.fillStyle = this.color;
      // 그림자를 X축으로 드리우기
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      // 점수
      context.fillText("Score: " + this.game.score, 20, 40);

      // 타이머
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      // 게임 오버 메시지
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score > this.game.winningScore) {
          message1 = "You win!";
          message2 = "Well done explorer!";
        } else {
          message1 = "You lose!";
          message2 = "Try again!";
        }
        context.font = "70px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 20,
        );
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 20,
        );
      }
      // 총알
      if (this.game.player.powerUp) context.fillStyle = "#ffffbd";
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      // 다시 복구.
      // save and restore를 안하게 되면, 렌더링되는 모든 값에 그림자가 생김
      context.restore();
    }
  }

  // 캔버스 width, height를 규정하여 페인팅 시 핵심 역할을 담당
  class Game {
    width: number;
    height: number;
    background: Background;
    player: Player;
    input: InputHandler;
    ui: UI;
    sound: SoundController;
    shield: Shield;
    keys: string[];
    enemies: Enemy[];
    particles: Particle[];
    explosions: Explosion[];
    enemyTimer: number;
    enemyInterval: number;
    ammo: number;
    maxAmmo: number;
    ammoTimer: number;
    ammoInterval: number;
    gameOver: boolean;
    score: number;
    winningScore: number;
    gameTime: number;
    timeLimit: number;
    speed: number;
    debug: boolean;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.shield = new Shield(this);
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.ammo = 20; // 초기 총알
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 350; // 0.5초마다 ammo 충전
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 80;
      this.gameTime = 0;
      this.timeLimit = 30000;
      this.speed = 1;
      this.debug = false;
    }

    update(deltaTime: number) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      // layer4만 따로 빼서 맨 앞에 배치되게 함
      this.background.layer4.update();
      // 총알 자동 생성
      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime; // 시간 흐름과 일치
      }
      // shield update
      this.shield.update(deltaTime);
      // 파티클 업데이트
      this.particles.forEach((particle) => {
        particle.update();
      });
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion,
      );
      // 폭발 효과
      this.explosions.forEach((explosion) => {
        explosion.update(deltaTime);
      });
      this.explosions = this.explosions.filter(
        (explosion) => !explosion.markedForDeletion,
      );
      // 적 자동 출현
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          this.sound.hit();
          this.shield.reset();
          // 적이 player와 충돌하면 파티클 최대 10번 생성
          for (let i = 0; i < enemy.score; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5,
              ),
            );
          }
          // lucky fish와 닿으면 powerUp
          if (enemy.type === "lucky") this.player.enterPowerUp();
          else if (!this.gameOver) this.score--;
        }
        // 투사체와 적 충돌 발생 시
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            // 투사체 피격 당 1파티클 생성
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5,
              ),
            );
            if (enemy.lives <= 0) {
              // 적 라이프가 0이 되면 파티클 최대 10번 생성
              for (let i = 0; i < enemy.score; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                  ),
                );
              }
              enemy.markedForDeletion = true;
              this.addExplosion(enemy);
              this.sound.explosion();
              // 파괴된 적이 moonfish 인 경우 power up
              if (enemy.type === "moonfish") {
                this.player.enterPowerUp();
              }
              // 파괴된 적이 hive whale 인 경우 drone 5기 생성
              if (enemy.type === "hiveWhale") {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(
                    new Drone(
                      this,
                      enemy.x + Math.random() * enemy.width,
                      enemy.y + Math.random() * enemy.height * 0.5,
                    ),
                  );
                }
              }
              if (!this.gameOver) this.score += enemy.score;
              // winning score 달성안해도 시간 남아있으면 게임 계속
              // if (this.score > this.winningScore) this.gameOver = true;
            }
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context: CanvasRenderingContext2D) {
      // background를 가장 먼저 draw해서 가장 뒤에 위치하게 함
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      this.shield.draw(context);
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.explosions.forEach((explosion) => {
        explosion.draw(context);
      });
      // 맨 앞에 위치하는 layer4
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.2) this.enemies.push(new Angler1(this));
      else if (randomize < 0.4) this.enemies.push(new Angler2(this));
      else if (randomize < 0.5) this.enemies.push(new Razorfin(this));
      else if (randomize < 0.6) this.enemies.push(new Stalker(this));
      else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
      else if (randomize < 0.8) this.enemies.push(new BulbWhale(this));
      else if (randomize < 0.9) this.enemies.push(new MoonFish(this));
      else this.enemies.push(new LuckyFish(this));
    }

    addExplosion(enemy: Enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5,
          ),
        );
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5,
          ),
        );
      }
    }
    // 아래 조건들을 모두 만족하면 충돌, 하나라도 false이면 충돌 X
    // 1. 적 영역이 왼쪽 위에서 플레이어 영역 x축 침범
    // 2. 적 영역이 오른쪽 아래에서 플레이어 영역 x축 침범
    // 3. 적 영역이 왼쪽 위에서 플레이어 영역 y축 침범
    // 4. 적 영역이 오른쪽 아래에서 플레이어 영역 y축 침범

    // 왼쪽위에서 충돌일 때는, 오른쪽 아래에서 충돌일 조건이 그냥 true
    // 마찬가지로, 오른쪽 아래에서 충돌일 때는, 왼쪽 아래에서 충돌일 조건이 그냥 true
    // 그래서 하나라도 false이면 충돌이 아님
    checkCollision(rect1: Player | Projectile, rect2: Enemy) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  // animation loop
  function animate(timeStamp: number) {
    const deltaTime = timeStamp - lastTime; // deltaTime 계산 : 프레임이 바뀌는 시간
    lastTime = timeStamp; // lastTime을 현재 timeStamp로 업데이트
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    requestAnimationFrame(animate); // animate 재귀 호출
    // requestAnimationFrame 함수는 자동으로 재실행마다 timestamp(밀리 세컨드)를 만들고, 이를 호출하는 함수 (animate)에 전달
  }
  animate(0); // 이전 직사각형 지우고 -> y 좌표 업데이트 -> 다시 draw -> 리페인트 이전에 animate 재호출
  // 첫 timeStamp로 그냥 0 넘겨줌
});
