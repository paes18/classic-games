/* Snake II Classic Nokia Game */

class SnakeGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;

    this.gridSize = 14;
    this.cols = Math.floor(canvas.width / this.gridSize);
    this.rows = Math.floor(canvas.height / this.gridSize);

    this.reset();
  }

  reset() {
    this.snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = this.spawnFood();
    this.bonusFood = null;
    this.bonusTimer = 0;
    this.score = 0;
    this.speed = 120;
    this.lastTime = 0;
    this.gameOver = false;
    this.paused = false;
  }

  spawnFood() {
    let food;
    while (!food || this.snake.some(s => s.x === food.x && s.y === food.y)) {
      food = {
        x: Math.floor(Math.random() * (this.cols - 2)) + 1,
        y: Math.floor(Math.random() * (this.rows - 2)) + 1
      };
    }
    return food;
  }

  spawnBonus() {
    this.bonusFood = {
      x: Math.floor(Math.random() * (this.cols - 2)) + 1,
      y: Math.floor(Math.random() * (this.rows - 2)) + 1
    };
    this.bonusTimer = 50; // frames
  }

  handleInput(key) {
    if (this.gameOver) return;
    if (key === 'UP' || key === '2') {
      if (this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
    } else if (key === 'DOWN' || key === '8') {
      if (this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
    } else if (key === 'LEFT' || key === '4') {
      if (this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
    } else if (key === 'RIGHT' || key === '6') {
      if (this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
    }
  }

  update(dt) {
    if (this.gameOver || this.paused) return;

    this.dir = this.nextDir;
    const head = {
      x: this.snake[0].x + this.dir.x,
      y: this.snake[0].y + this.dir.y
    };

    // Wall Wraparound (Nokia Snake II Feature)
    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    // Self Collision Check
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this.gameOver = true;
      window.nokiaAudio.playDieSFX();
      if (this.onGameOver) this.onGameOver(this.score);
      return;
    }

    this.snake.unshift(head);

    // Eat Normal Food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      window.nokiaAudio.playEatSFX();
      this.food = this.spawnFood();

      if (Math.random() < 0.25 && !this.bonusFood) {
        this.spawnBonus();
      }
    } else if (this.bonusFood && head.x === this.bonusFood.x && head.y === this.bonusFood.y) {
      this.score += 50;
      window.nokiaAudio.playPointSFX();
      this.bonusFood = null;
    } else {
      this.snake.pop();
    }

    // Bonus timer countdown
    if (this.bonusFood) {
      this.bonusTimer--;
      if (this.bonusTimer <= 0) this.bonusFood = null;
    }
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Outer Border
    ctx.strokeStyle = pixelColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);

    // Draw Snake
    ctx.fillStyle = pixelColor;
    this.snake.forEach((seg, i) => {
      ctx.fillRect(
        seg.x * this.gridSize + 1,
        seg.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
      // Detail on head
      if (i === 0) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(
          seg.x * this.gridSize + 4,
          seg.y * this.gridSize + 4,
          this.gridSize - 8,
          this.gridSize - 8
        );
        ctx.fillStyle = pixelColor;
      }
    });

    // Draw Food (Classic Dot)
    ctx.fillRect(
      this.food.x * this.gridSize + 3,
      this.food.y * this.gridSize + 3,
      this.gridSize - 6,
      this.gridSize - 6
    );

    // Draw Bonus Insect (Flashing)
    if (this.bonusFood && Math.floor(Date.now() / 150) % 2 === 0) {
      ctx.fillRect(
        this.bonusFood.x * this.gridSize + 1,
        this.bonusFood.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    // Score Banner
    ctx.font = '16px "VT323", monospace';
    ctx.fillStyle = pixelColor;
    ctx.fillText(`SCORE:${this.score}`, 6, 18);

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 90, this.canvas.width - 40, 50);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER!', this.canvas.width / 2, 115);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 132);
      ctx.textAlign = 'left';
    }
  }
}
