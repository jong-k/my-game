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
		speedY: number;
		maxSpeed: number;
		projectiles: Projectile[];

		constructor(game: Game) {
			this.game = game;
			this.width = 120; // player의 외형
			this.height = 190;
			this.x = 20;
			this.y = 100;
			this.speedY = -1; // player의 속도. 음수이면 위로 움직임
			this.maxSpeed = 2;
			this.projectiles = [];
		}
		update() {
			if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
			else if (this.game.keys.includes('ArrowDown'))
				this.speedY = this.maxSpeed;
			else this.speedY = 0;
			this.y += this.speedY; // player 움직이게 하는 동작
			// handle projectiles
			this.projectiles.forEach((projectile) => {
				projectile.update();
			});
			this.projectiles = this.projectiles.filter(
				(projectile) => !projectile.markedForDeletion // false인 것만 남김
			);
		}
		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = 'black';
			context.fillRect(this.x, this.y, this.width, this.height);
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
		abstract width: number;
		abstract height: number;
		abstract y: number;

		constructor(game: Game) {
			this.game = game;
			this.x = this.game.width;
			this.speedX = Math.random() * -1.5 - 0.5; // 적들은 오른쪽 끝에서 다가오는 위치
			this.markedForDeletion = false;
		}

		update() {
			this.x += this.speedX;
			// canvas 왼쪽끝을 지나쳐서 안보이게 되면 제거됨
			if (this.x + this.width < 0) this.markedForDeletion = true;
		}

		draw(context: CanvasRenderingContext2D) {
			context.fillStyle = 'red';
			context.fillRect(this.x, this.y, this.width, this.height);
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
	// class Layer {}

	// 모든 레이어를 모음
	// class Background {}

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
			// 총알
			context.fillStyle = this.color;
			for (let i = 0; i < this.game.ammo; i++) {
				context.fillRect(20 + 5 * i, 50, 3, 20);
			}
		}
	}

	// 캔버스 width, height를 규정하여 페인팅 시 핵심 역할을 담당
	class Game {
		width: number;
		height: number;
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

		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
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
		}
		update(deltaTime: number) {
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
			this.player.draw(context);
			this.ui.draw(context);
			this.enemies.forEach((enemy) => {
				enemy.draw(context);
			});
		}
		addEnemy() {
			this.enemies.push(new Angler1(this));
		}
		//
		checkCollision(rect1: Player, rect2: Angler1) {
			return (
				rect1.x < rect2.x + rect2.width &&
				rect1.x + rect1.width > rect2.x &&
				rect1.y < rect2.y + rect2.height &&
				rect1.height + rect1.y > rect2.y
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
