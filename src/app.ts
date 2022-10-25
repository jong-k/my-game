window.addEventListener('load', function () {
	// canvas setup
	const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
	// 렌더링 컨텍스트 얻기
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	canvas.width = 500;
	canvas.height = 500;

	// 클래스는 호이스팅 가능하므로 밑에 배치해도 됨
	class InputHandler {
		game: Game;
		constructor(game: Game) {
			this.game = game;
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
			window.addEventListener('keyup', (e) => {
				if (this.game.keys.indexOf(e.key) > -1) {
					this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
				}
			});
		}
	}

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

	// class Particle {}

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
			this.speedY = -1; // player의 속도. 음수로 하면 위로 움직임
			this.maxSpeed = 2;
			this.projectiles = [];
		}
		update() {
			if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
			else if (this.game.keys.includes('ArrowDown'))
				this.speedY = this.maxSpeed;
			else this.speedY = 0;
			this.y += this.speedY;
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

	// class Enemy {}

	// class Layer {}

	// class Background {}

	// class UI {}

	// 프로젝트의 핵심 클래스
	class Game {
		width: number;
		height: number;
		player: Player;
		input: InputHandler;
		keys: string[];
		ammo: number;
		maxAmmo: number;
		ammoTimer: number;
		ammoInterval: number;
		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
			this.player = new Player(this);
			this.input = new InputHandler(this);
			this.keys = [];
			this.ammo = 20; // 초기 총알
			this.maxAmmo = 50;
			this.ammoTimer = 0;
			this.ammoInterval = 500; // 0.5초마다 ammo 충전
		}
		update(deltaTime: number) {
			this.player.update();
			if (this.ammoTimer > this.ammoInterval) {
				if (this.ammo < this.maxAmmo) this.ammo++;
				this.ammoTimer = 0;
			} else {
				this.ammoTimer += deltaTime;
			}
		}
		draw(context: CanvasRenderingContext2D) {
			this.player.draw(context);
		}
	}

	const game = new Game(canvas.width, canvas.height);
	let lastTime = 0;

	// animation loop
	function animate(timeStamp: number) {
		const deltaTime = timeStamp - lastTime; // deltaTime 계산
		lastTime = timeStamp; // lastTime을 현재 timeStamp로 업데이트
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.update(deltaTime);
		game.draw(ctx);
		requestAnimationFrame(animate); // 재실행
		// requestAnimationFrame 함수는 자동으로 재실행마다 timestamp(밀리 세컨드)를 만들고, 이를 호출하는 함수 (animate)에 전달
	}
	animate(0); // 이전 직사각형 지우고 -> y 좌표 업데이트 -> 다시 draw -> 리페인트 이전에 animate 재호출
	// 첫 timeStamp로 그냥 0 넘겨줌
});
