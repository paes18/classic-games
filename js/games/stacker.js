/* Block Cascade (Tetris Classic) Nokia Game */

class StackerGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;

    this.cols = 10;
    this.rows = 18;
    this.blockSize = 14;
    this.offsetX = 10;
    this.offsetY = 20;

    this.shapes = [
      [[1,1,1,1]], // I
      [[1,1],[1,1]], // O
      [[0,1,0],[1,1,1]], // T
      [[1,0,0],[1,1,1]], // L
      [[0,0,1],[1,1,1]], // J
      [[0,1,1],[1,1,0]], // S
      [[1,1,0],[0,1,1]]  // Z
    ];

    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.linesCleared = 0;
    this.level = 1;
    this.dropCounter = 0;
    this.dropInterval = 800; // ms
    this.lastTime = performance.now();
    this.gameOver = false;

    this.currentPiece = this.spawnPiece();
    this.nextPiece = this.spawnPiece();
  }

  spawnPiece() {
    const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    return {
      matrix: shape,
      x: Math.floor(this.cols / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
  }

  handleInput(key) {
    if (this.gameOver) return;
    if (key === 'LEFT' || key === '4' || key === 'a') {
      this.move(-1);
    } else if (key === 'RIGHT' || key === '6' || key === 'd') {
      this.move(1);
    } else if (key === 'DOWN' || key === '8' || key === 's') {
      this.drop();
    } else if (key === 'UP' || key === '2' || key === 'w' || key === 'SELECT' || key === 'SPACE') {
      this.rotate();
    }
  }

  move(dir) {
    this.currentPiece.x += dir;
    if (this.collide()) {
      this.currentPiece.x -= dir;
    } else {
      window.nokiaAudio.playRotateSFX();
    }
  }

  rotate() {
    const matrix = this.currentPiece.matrix;
    const rotated = matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    const prev = this.currentPiece.matrix;
    this.currentPiece.matrix = rotated;
    if (this.collide()) {
      this.currentPiece.matrix = prev;
    } else {
      window.nokiaAudio.playRotateSFX();
    }
  }

  drop() {
    this.currentPiece.y++;
    if (this.collide()) {
      this.currentPiece.y--;
      this.merge();
      this.clearLines();
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.spawnPiece();
      if (this.collide()) {
        this.gameOver = true;
        window.nokiaAudio.playDieSFX();
        if (this.onGameOver) this.onGameOver(this.score);
      }
    }
    this.dropCounter = 0;
  }

  collide() {
    const m = this.currentPiece.matrix;
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c] !== 0) {
          const newX = this.currentPiece.x + c;
          const newY = this.currentPiece.y + r;
          if (newX < 0 || newX >= this.cols || newY >= this.rows || (newY >= 0 && this.grid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  merge() {
    const m = this.currentPiece.matrix;
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c] !== 0) {
          this.grid[this.currentPiece.y + r][this.currentPiece.x + c] = 1;
        }
      }
    }
  }

  clearLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(cell => cell !== 0)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        cleared++;
        r++; // check same row index again
      }
    }
    if (cleared > 0) {
      this.linesCleared += cleared;
      this.score += cleared * 100 * this.level;
      window.nokiaAudio.playPointSFX();
      this.level = Math.floor(this.linesCleared / 5) + 1;
      this.dropInterval = Math.max(150, 800 - (this.level - 1) * 70);
    }
  }

  update(time = 0) {
    if (this.gameOver) return;
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += dt;
    if (this.dropCounter > this.dropInterval) {
      this.drop();
    }
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid Frame
    ctx.strokeStyle = pixelColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.offsetX - 2, this.offsetY - 2, this.cols * this.blockSize + 4, this.rows * this.blockSize + 4);

    ctx.fillStyle = pixelColor;

    // Draw Grid
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== 0) {
          ctx.fillRect(this.offsetX + c * this.blockSize, this.offsetY + r * this.blockSize, this.blockSize - 1, this.blockSize - 1);
        }
      }
    }

    // Draw Current Piece
    if (this.currentPiece) {
      const m = this.currentPiece.matrix;
      for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
          if (m[r][c] !== 0) {
            ctx.fillRect(
              this.offsetX + (this.currentPiece.x + c) * this.blockSize,
              this.offsetY + (this.currentPiece.y + r) * this.blockSize,
              this.blockSize - 1,
              this.blockSize - 1
            );
          }
        }
      }
    }

    // Draw Side Panel (Next Piece & Score)
    const sideX = 160;
    ctx.font = '14px "VT323", monospace';
    ctx.fillText(`NEXT:`, sideX, 35);

    // Next Piece Preview
    if (this.nextPiece) {
      const nm = this.nextPiece.matrix;
      for (let r = 0; r < nm.length; r++) {
        for (let c = 0; c < nm[r].length; c++) {
          if (nm[r][c] !== 0) {
            ctx.fillRect(sideX + c * 10, 45 + r * 10, 9, 9);
          }
        }
      }
    }

    ctx.fillText(`SCORE:`, sideX, 100);
    ctx.fillText(`${this.score}`, sideX, 115);

    ctx.fillText(`LINES:`, sideX, 140);
    ctx.fillText(`${this.linesCleared}`, sideX, 155);

    ctx.fillText(`LEVEL:`, sideX, 180);
    ctx.fillText(`${this.level}`, sideX, 195);

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
