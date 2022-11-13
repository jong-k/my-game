// type: 'load' : 서버로부터 전체 파일 (HTML, CSS, image 등) 을 모두 응답으로 받았을 때
window.addEventListener('load', function () {
	// canvas setup
	const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
	// 렌더링 컨텍스트 얻기, 컨텍스트는 2D 또는 WebGL (3D) 가능
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	canvas.width = 500;
	canvas.height = 500;

	// 클래스는 호이스팅 가능하므로 밑에 배치해도 됨
	// 유저 인풋을 처리하는 클래스
	class InputHandler {
		game: Game;

		constructor(game: Game) {
			this.game = game;
			// 화살표 위, 아래 키가 눌리면 Game 클래스의 눌린 키 보관하는 배열인 key에 push
			// 같은 키를 계속 누르고 있어도 계속 push되지 않게 구현 ->
			// 왜냐하면, 키 계속 누르고 있다가 떼면 키업은 많은데, 키다운은 1번밖에 없어져서 처리하기가 곤란함
			window.addEventListener('keydown', (e) => {
				if (
					(e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
					this.game.keys.indexOf(e.key) === -1
				) {
					this.game.keys.push(e.key);
				} else if (e.key === ' ') {
					// 스페이스바 입력
					this.game.player.shootTop();
				}
			});
			// 키를 떼면, Game 클래스의 keys 배열에서 제거
			window.addEventListener('keyup', (e) => {
				if (this.game.keys.indexOf(e.key) > -1) {
					this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
				}
			});
		}
	}
	// 플레이어가 사용하는 투사체 담당 클래스
	class Projectile {
		game: Game;
		x: number;
		y: number;
		width: number;
		height: number;
		speed: number;
		markedForDeletion: boolean;

		constructor(game: Game, x: number, y: number) {
			this.game = game;
			this.x = x;
			this.y = y;
			this.width = 10;
			this.height = 3;
			this.speed = 3;
			this.markedForDeletion = false; // 투사체가 멀어져서 삭제 가능한 상태인지 여부
		}
		update() {
			this.x += this.speed;
			if (this.x > this.game.width * 0.8) this.markedForDeletion = true; // width 80% 넘어가면 삭제 가능하게 바꿈
		}
		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = 'yellow';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	// 적의 피격 효과 처리를 담당하는 클래스
	// class Particle {}

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

		constructor(game: Game) {
			this.game = game;
			this.width = 120; // player의 외형
			this.height = 190;
			this.x = 20;
			this.y = 100;
			this.frameX = 0;
			this.frameY = 0;
			this.maxFrame = 37; // player.png는 37장 이미지 갖고 잇음
			this.speedY = -1; // player의 속도. 음수이면 위로 움직임
			this.maxSpeed = 2;
			this.projectiles = [];
			this.image = document.getElementById('player') as HTMLImageElement;
		}
		update() {
			if (this.game.keys.includes('ArrowUp'))
				this.speedY = -this.maxSpeed; // y 감소
			else if (this.game.keys.includes('ArrowDown'))
				this.speedY = this.maxSpeed; // y 증가
			else this.speedY = 0;
			this.y += this.speedY; // player 움직이게 하는 동작
			// 투사체 조작
			this.projectiles.forEach((projectile) => {
				projectile.update();
			});
			this.projectiles = this.projectiles.filter(
				(projectile) => !projectile.markedForDeletion // false인 것만 남김 (true인 것은 배열에서 빠져서 렌더링 안됨)
			);
			// sprite animation
			// 살짝 다르고 크게는 같은 이미지 여러장이 일렬로 늘어선 이미지를 사용하여,
			// 일정 부분씩 잘라서 연속적으로 렌더링하면서 마치 플레이어가 움직이는 듯한 효과를 줌
			if (this.frameX < this.maxFrame) {
				this.frameX++;
			} else {
				this.frameX = 0;
			}
		}
		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = 'black';
			context.fillRect(this.x, this.y, this.width, this.height);
			context.drawImage(
				this.image,
				this.frameX * this.width,
				this.frameY * this.height,
				this.width,
				this.height,
				this.x,
				this.y,
				this.width,
				this.height
			);
			this.projectiles.forEach((projectile) => projectile.draw(context));
		}
		shootTop() {
			if (this.game.ammo > 0) {
				this.projectiles.push(
					new Projectile(this.game, this.x + 80, this.y + 30)
				);
				this.game.ammo--;
			}
		}
	}

	// 적들의 움직임 등을 담당
	abstract class Enemy {
		game: Game;
		x: number;
		speedX: number;
		markedForDeletion: boolean;
		lives: number;
		score: number;
		abstract width: number;
		abstract height: number;
		abstract y: number;

		constructor(game: Game) {
			this.game = game;
			this.x = this.game.width;
			this.speedX = Math.random() * -1.5 - 0.5; // 적들은 오른쪽 끝에서 다가오는 위치
			this.markedForDeletion = false;
			this.lives = 5;
			this.score = this.lives;
		}

		update() {
			this.x += this.speedX;
			// canvas 왼쪽끝을 지나쳐서 안보이게 되면 제거됨
			if (this.x + this.width < 0) this.markedForDeletion = true;
		}

		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = 'red';
			context.fillRect(this.x, this.y, this.width, this.height);
			context.fillStyle = 'black';
			context.font = '20px Helvetica';
			context.fillText(String(this.lives), this.x, this.y);
		}
	}

	class Angler1 extends Enemy {
		width: number;
		height: number;
		y: number;

		constructor(game: Game) {
			super(game);
			this.width = 228 * 0.2;
			this.height = 169 * 0.2;
			this.y = Math.random() * (this.game.height * 0.9 - this.height);
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
			this.image1 = document.getElementById('layer1') as HTMLImageElement;
			this.image2 = document.getElementById('layer2') as HTMLImageElement;
			this.image3 = document.getElementById('layer3') as HTMLImageElement;
			this.image4 = document.getElementById('layer4') as HTMLImageElement;
			this.layer1 = new Layer(this.game, this.image1, 0.2);
			this.layer2 = new Layer(this.game, this.image2, 0.4);
			this.layer3 = new Layer(this.game, this.image3, 1);
			this.layer4 = new Layer(this.game, this.image4, 1.5);
			// layer4는 가장 앞에 렌더링되어야 하기 때문에 따로 빼줌
			this.layers = [this.layer1, this.layer2, this.layer3];
		}
		update() {
			this.layers.forEach((layer) => layer.update());
		}
		draw(context: CanvasRenderingContext2D) {
			this.layers.forEach((layer) => layer.draw(context));
		}
	}

	// 타이머, 글로벌 UI
	class UI {
		game: Game;
		fontSize: number;
		fontFamily: string;
		color: 'white';
		constructor(game: Game) {
			this.game = game;
			this.fontSize = 25;
			this.fontFamily = 'Helvetica';
			this.color = 'white';
		}
		draw(context: CanvasRenderingContext2D) {
			// 기본값을 저장하고 변형한 것을 렌더링하다가
			context.save();
			context.fillStyle = this.color;
			// 그림자를 X축으로 드리우기
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;
			context.shadowColor = 'black';
			context.font = this.fontSize + 'px ' + this.fontFamily;
			// 점수
			context.fillText('Score: ' + this.game.score, 20, 40);
			// 총알
			context.fillStyle = this.color;
			for (let i = 0; i < this.game.ammo; i++) {
				context.fillRect(20 + 5 * i, 50, 3, 20);
			}
			// 타이머
			const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
			context.fillText('Timer: ' + formattedTime, 20, 100);
			// 게임 오버 메시지
			if (this.game.gameOver) {
				context.textAlign = 'center';
				let message1;
				let message2;
				if (this.game.score > this.game.winningScore) {
					message1 = 'You win!';
					message2 = 'Well done!';
				} else {
					message1 = 'You lose!';
					message2 = 'Try again next time!';
				}
				context.font = '50px ' + this.fontFamily;
				context.fillText(
					message1,
					this.game.width * 0.5,
					this.game.height * 0.5 - 40
				);
				context.font = '25px ' + this.fontFamily;
				context.fillText(
					message2,
					this.game.width * 0.5,
					this.game.height * 0.5 + 40
				);
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
		keys: string[];
		enemies: Enemy[];
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

		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
			this.background = new Background(this);
			this.player = new Player(this);
			this.input = new InputHandler(this);
			this.ui = new UI(this);
			this.keys = [];
			this.enemies = [];
			this.ammo = 20; // 초기 총알
			this.maxAmmo = 50;
			this.ammoTimer = 0;
			this.ammoInterval = 500; // 0.5초마다 ammo 충전
			this.enemyTimer = 0;
			this.enemyInterval = 1000;
			this.gameOver = false;
			this.score = 0;
			this.winningScore = 10;
			this.gameTime = 0;
			this.timeLimit = 5000;
			this.speed = 1;
		}
		update(deltaTime: number) {
			if (!this.gameOver) this.gameTime += deltaTime;
			if (this.gameTime > this.timeLimit) this.gameOver = true;
			this.background.update();
			// layer4만 따로 빼서 맨 앞에 배치되게 함
			this.background.layer4.update();
			// 총알 자동 생성
			this.player.update();
			if (this.ammoTimer > this.ammoInterval) {
				if (this.ammo < this.maxAmmo) this.ammo++;
				this.ammoTimer = 0;
			} else {
				this.ammoTimer += deltaTime; // 시간 흐름과 일치
			}

			// 적 자동 출현
			this.enemies.forEach((enemy) => {
				enemy.update();
				if (this.checkCollision(this.player, enemy)) {
					enemy.markedForDeletion = true;
				}
				this.player.projectiles.forEach((projectile) => {
					if (this.checkCollision(projectile, enemy)) {
						enemy.lives--;
						projectile.markedForDeletion = true;
						if (enemy.lives <= 0) {
							enemy.markedForDeletion = true;
							if (!this.gameOver) this.score += enemy.score;
							if (this.score > this.winningScore) this.gameOver = true;
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
			this.player.draw(context);
			this.ui.draw(context);
			this.enemies.forEach((enemy) => {
				enemy.draw(context);
			});
			// 맨 앞에 위치하는 layer4
			this.background.layer4.draw(context);
		}
		addEnemy() {
			this.enemies.push(new Angler1(this));
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
		game.update(deltaTime);
		game.draw(ctx);
		requestAnimationFrame(animate); // animate 재귀 호출
		// requestAnimationFrame 함수는 자동으로 재실행마다 timestamp(밀리 세컨드)를 만들고, 이를 호출하는 함수 (animate)에 전달
	}
	animate(0); // 이전 직사각형 지우고 -> y 좌표 업데이트 -> 다시 draw -> 리페인트 이전에 animate 재호출
	// 첫 timeStamp로 그냥 0 넘겨줌
});
