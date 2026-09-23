/* Bounce Classic Nokia Platformer Game */

class BounceGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.reset();
  }

  reset() {
    this.ball = {
      x: 30,
      y: 180,
      r: 8,
      vx: 0,
      vy: 0,
      onGround: false
    };

    this.gravity = 0.3;
    this.jumpForce = -6.0;
    this.speed = 2.2;
    this.score = 0;
    this.ringsCollected = 0;
    this.totalRings = 5;
    this.gameOver = false;
    this.gameWon = false;

    // Level map platforms
    this.platforms = [
      { x: 0, y: 220, w: 280, h: 20 },
      { x: 70, y: 170, w: 50, h: 12 },
      { x: 140, y: 130, w: 60, h: 12 },
      { x: 210, y: 90, w: 60, h: 12 }
    ];

    // Spikes (deadly)
    this.spikes = [
      { x: 100, y: 210, w: 12, h: 10 },
      { x: 180, y: 120, w: 12, h: 10 }
    ];

    // Rings to collect
    this.rings = [
      { x: 90, y: 145, collected: false },
      { x: 160, y: 105, collected: false },
      { x: 230, y: 65, collected: false },
      { x: 40, y: 195, collected: false },
      { x: 250, y: 195, collected: false }
    ];

    // Goal Flag
    this.flag = { x: 250, y: 60, w: 12, h: 30 };
  }

  handleInput(key) {
    if (this.gameOver) return;
    if ((key === 'UP' || key === '2' || key === 'SELECT' || key === 'SPACE') && this.ball.onGround) {
      this.ball.vy = this.jumpForce;
      this.ball.onGround = false;
      window.nokiaAudio.playBounceSFX();
    }
  }

  updateInput(keysPressed) {
    if (this.gameOver) return;
    this.ball.vx = 0;
    if (keysPressed['LEFT'] || keysPressed['4'] || keysPressed['a']) {
      this.ball.vx = -this.speed;
    }
    if (keysPressed['RIGHT'] || keysPressed['6'] || keysPressed['d']) {
      this.ball.vx = this.speed;
    }
  }

  update() {
    if (this.gameOver) return;

    // Apply gravity
    this.ball.vy += this.gravity;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Keep inside horizontal bounds
    this.ball.x = Math.max(this.ball.r, Math.min(this.canvas.width - this.ball.r, this.ball.x));

    // Check Platform Collisions
    this.ball.onGround = false;
    this.platforms.forEach(p => {
      if (
        this.ball.x + this.ball.r > p.x &&
        this.ball.x - this.ball.r < p.x + p.w &&
        this.ball.y + this.ball.r >= p.y &&
        this.ball.y - this.ball.r < p.y + p.h &&
        this.ball.vy >= 0
      ) {
        this.ball.y = p.y - this.ball.r;
        this.ball.vy = 0;
        this.ball.onGround = true;
      }
    });

    // Check Spikes Collision
    this.spikes.forEach(s => {
      if (
        this.ball.x + this.ball.r > s.x &&
        this.ball.x - this.ball.r < s.x + s.w &&
        this.ball.y + this.ball.r > s.y &&
        this.ball.y - this.ball.r < s.y + s.h
      ) {
        this.gameOver = true;
        window.nokiaAudio.playDieSFX();
        if (this.onGameOver) this.onGameOver(this.score);
      }
    });

    // Ring Collection
    this.rings.forEach(r => {
      if (!r.collected) {
        const dist = Math.hypot(this.ball.x - r.x, this.ball.y - r.y);
        if (dist < this.ball.r + 8) {
          r.collected = true;
          this.ringsCollected++;
          this.score += 50;
          window.nokiaAudio.playEatSFX();
        }
      }
    });

    // Win condition at Goal Flag
    if (this.ringsCollected >= this.totalRings) {
      if (
        this.ball.x + this.ball.r > this.flag.x &&
        this.ball.x - this.ball.r < this.flag.x + this.flag.w &&
        this.ball.y + this.ball.r > this.flag.y
      ) {
        this.gameOver = true;
        this.gameWon = true;
        this.score += 200;
        window.nokiaAudio.playPointSFX();
        if (this.onGameOver) this.onGameOver(this.score);
      }
    }

    // Fall out of map
    if (this.ball.y > this.canvas.height + 20) {
      this.gameOver = true;
      window.nokiaAudio.playDieSFX();
      if (this.onGameOver) this.onGameOver(this.score);
    }
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;

    // Draw Platforms
    this.platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 2);
      ctx.fillStyle = pixelColor;
    });

    // Draw Spikes
    this.spikes.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + s.h);
      ctx.lineTo(s.x + s.w / 2, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.closePath();
      ctx.fill();
    });

    // Draw Rings
    this.rings.forEach(r => {
      if (!r.collected) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 7, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = pixelColor;
        ctx.stroke();
      }
    });

    // Draw Flag Goal
    ctx.fillRect(this.flag.x, this.flag.y, 3, this.flag.h);
    ctx.beginPath();
    ctx.moveTo(this.flag.x + 3, this.flag.y);
    ctx.lineTo(this.flag.x + 14, this.flag.y + 6);
    ctx.lineTo(this.flag.x + 3, this.flag.y + 12);
    ctx.fill();

    // Draw Ball
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bgColor;
    ctx.fillRect(this.ball.x - 2, this.ball.y - 2, 3, 3);
    ctx.fillStyle = pixelColor;

    // HUD Header
    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`BOUNCE RINGS:${this.ringsCollected}/${this.totalRings} PTS:${this.score}`, 6, 16);

    if (this.gameOver) {
      ctx.fillStyle = pixelColor;
      ctx.fillRect(20, 90, this.canvas.width - 40, 50);
      ctx.fillStyle = bgColor;
      ctx.font = '20px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.gameWon ? 'VICTORY!' : 'GAME OVER!', this.canvas.width / 2, 115);
      ctx.font = '14px "VT323", monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, 132);
      ctx.textAlign = 'left';
    }
  }
}
