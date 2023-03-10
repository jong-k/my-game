// type: 'load' : 서버로부터 전체 파일 (HTML, CSS, image 등) 을 모두 응답으로 받았을 때
window.addEventListener("load", function () {
  // canvas setup
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  // 렌더링 컨텍스트 얻기, 컨텍스트는 2D 또는 WebGL (3D) 가능
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 700;
  canvas.height = 500;

  // 클래스는 호이스팅 가능하므로 밑에 배치해도 됨
  // 유저 인풋에 따라 플레이어 움직임을 처리하는 클래스
  class InputHandler {
    game: Game;

    constructor(game: Game) {
      this.game = game;
      // 화살표 위, 아래 키가 눌리면 Game 클래스의 눌린 키 보관하는 배열인 key에 push
      // 같은 키를 계속 누르고 있어도 계속 push되지 않게 구현 ->
      // 왜냐하면, 키 계속 누르고 있다가 떼면 keydown은 많은데, keyup은 1번밖에 없어져서 처리하기가 곤란함
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
      context.save();
      context.fillStyle = this.color;
      // 그림자를 X축으로 드리우기
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;

      // 게임 오버 메
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
    input: InputHandler;
    ui: UI;
    keys: string[];
    gameTime: number;
    timeLimit: number;
    speed: number;
    debug: boolean;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = [];
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
    }

    draw(context: CanvasRenderingContext2D) {
      // background를 가장 먼저 draw해서 가장 뒤에 위치하게 함
      this.background.draw(context);
      this.ui.draw(context);
      // 맨 앞에 위치하는 layer4
      this.background.layer4.draw(context);
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
