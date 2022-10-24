window.addEventListener('load', function () {
	// canvas setup
	const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
	const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
	canvas.width = 500;
	canvas.height = 500;

	// 클래스는 호이스팅 가능하므로 밑에 배치해도 됨
	// class InputHandler {}

	// class Projectile {}

	// class Particle {}

	class Player {
		game: Game;
		width: number;
		height: number;
		x: number;
		y: number;
		speedY: number;
		constructor(game: Game) {
			this.game = game;
			this.width = 120; // player의 외형
			this.height = 190;
			this.x = 20;
			this.y = 100;
			this.speedY = -1; // player의 속도. 음수로 하면 위로 움직임
		}
		update() {
			this.y += this.speedY;
		}
		draw(context: CanvasRenderingContext2D) {
			context.fillRect(this.x, this.y, this.width, this.height);
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
		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
			this.player = new Player(this);
		}
		update() {
			this.player.update();
		}
		draw(context: CanvasRenderingContext2D) {
			this.player.draw(context);
		}
	}

	const game = new Game(canvas.width, canvas.height);
	// animation loop
	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.update();
		game.draw(ctx);
		requestAnimationFrame(animate);
	}
	animate();
});
