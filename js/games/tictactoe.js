/* Tic-Tac-Toe Classic Nokia Game */

class TicTacToeGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(null);
    this.cursor = 4; // Center
    this.turn = 'X'; // Player X
    this.vsAI = true;
    this.winner = null;
    this.winningLine = null;
    this.score = 0;
    this.gameOver = false;
  }

  handleInput(key) {
    if (this.gameOver) return;

    if (key === 'UP' || key === '2') {
      if (this.cursor >= 3) this.cursor -= 3;
    } else if (key === 'DOWN' || key === '8') {
      if (this.cursor < 6) this.cursor += 3;
    } else if (key === 'LEFT' || key === '4') {
      if (this.cursor % 3 > 0) this.cursor--;
    } else if (key === 'RIGHT' || key === '6') {
      if (this.cursor % 3 < 2) this.cursor++;
    } else if (key === 'SELECT' || key === '5' || key === 'SPACE' || key === 'ENTER') {
      this.makeMove(this.cursor);
    }
  }

  makeMove(index) {
    if (this.board[index] || this.winner) return;

    this.board[index] = this.turn;
    window.nokiaAudio.playSelectBeep();

    if (this.checkWin()) {
      this.winner = this.turn;
      this.gameOver = true;
      if (this.winner === 'X') this.score += 100;
      window.nokiaAudio.playPointSFX();
      if (this.onGameOver) this.onGameOver(this.score);
      return;
    }

    if (this.board.every(cell => cell !== null)) {
      this.winner = 'DRAW';
      this.gameOver = true;
      window.nokiaAudio.playBackBeep();
      if (this.onGameOver) this.onGameOver(this.score);
      return;
    }

    // Switch turn
    this.turn = this.turn === 'X' ? 'O' : 'X';

    // AI Move
    if (this.vsAI && this.turn === 'O' && !this.gameOver) {
      setTimeout(() => this.aiMove(), 300);
    }
  }

  aiMove() {
    // 1. Check if AI can win
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = 'O';
        if (this.checkWin()) {
          this.winner = 'O';
          this.gameOver = true;
          window.nokiaAudio.playDieSFX();
          if (this.onGameOver) this.onGameOver(this.score);
          return;
        }
        this.board[i] = null;
      }
    }

    // 2. Block player X win
    for (let i = 0; i < 9; i++) {
      if (!this.board[i]) {
        this.board[i] = 'X';
        if (this.checkWin()) {
          this.board[i] = 'O';
          this.turn = 'X';
          window.nokiaAudio.playSelectBeep();
          return;
        }
        this.board[i] = null;
      }
    }

    // 3. Take center or random
    const available = this.board.map((v, idx) => v === null ? idx : null).filter(v => v !== null);
    if (available.length > 0) {
      const choice = available.includes(4) ? 4 : available[Math.floor(Math.random() * available.length)];
      this.board[choice] = 'O';
      if (this.checkWin()) {
        this.winner = 'O';
        this.gameOver = true;
        window.nokiaAudio.playDieSFX();
        if (this.onGameOver) this.onGameOver(this.score);
      } else if (this.board.every(cell => cell !== null)) {
        this.winner = 'DRAW';
        this.gameOver = true;
      } else {
        this.turn = 'X';
      }
    }
  }

  checkWin() {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // Rows
      [0,3,6], [1,4,7], [2,5,8], // Cols
      [0,4,8], [2,4,6]          // Diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winningLine = line;
        return true;
      }
    }
    return false;
  }

  update() {}

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;
    ctx.strokeStyle = pixelColor;
    ctx.lineWidth = 3;

    // Header
    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`TIC-TAC-TOE TURN: ${this.turn}`, 10, 20);

    // Draw 3x3 Grid
    const startX = 40;
    const startY = 35;
    const cellSize = 65;

    ctx.beginPath();
    // Vertical Lines
    ctx.moveTo(startX + cellSize, startY);
    ctx.lineTo(startX + cellSize, startY + cellSize * 3);
    ctx.moveTo(startX + cellSize * 2, startY);
    ctx.lineTo(startX + cellSize * 2, startY + cellSize * 3);

    // Horizontal Lines
    ctx.moveTo(startX, startY + cellSize);
    ctx.lineTo(startX + cellSize * 3, startY + cellSize);
    ctx.moveTo(startX, startY + cellSize * 2);
    ctx.lineTo(startX + cellSize * 3, startY + cellSize * 2);
    ctx.stroke();

    // Draw X and O Marks
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3);
      const c = i % 3;
      const cx = startX + c * cellSize + cellSize / 2;
      const cy = startY + r * cellSize + cellSize / 2;

      // Draw Cursor highlight box
      if (i === this.cursor && !this.gameOver) {
        ctx.fillStyle = pixelColor;
        ctx.fillRect(startX + c * cellSize + 4, startY + r * cellSize + 4, cellSize - 8, cellSize - 8);
        ctx.fillStyle = bgColor;
      } else {
        ctx.fillStyle = pixelColor;
      }

      const val = this.board[i];
      if (val === 'X') {
        ctx.font = 'bold 36px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('X', cx, cy);
      } else if (val === 'O') {
        ctx.font = 'bold 36px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('O', cx, cy);
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 90, this.canvas.width - 40, 60);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      const msg = this.winner === 'DRAW' ? 'MATCH DRAW!' : `${this.winner} WINS!`;
      ctx.fillText(msg, this.canvas.width / 2, 120);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 138);
      ctx.textAlign = 'left';
    }
  }
}
