/* Rapid Roll Classic Nokia Game */

class RapidRollGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.reset();
  }

  reset() {
    this.ball = {
      x: this.canvas.width / 2,
      y: 50,
      r: 6,
      vx: 0,
      speed: 4,
      lives: 3
    };

    this.platforms = [];
    this.scrollSpeed = 1.5;
    this.spawnTimer = 0;
    this.score = 0;
    this.gameOver = false;
    this.gravity = 0.4;
    this.vy = 0;

    // Initial platforms
    for (let i = 0; i < 5; i++) {
      this.platforms.push({
        x: Math.random() * (this.canvas.width - 60),
        y: 60 + i * 40,
        w: 50,
        h: 8,
        type: 'normal' // normal, spike, heart
      });
    }
  }

  handleInput(key) {
    // Managed via updateInput
  }

  updateInput(keysPressed) {
    if (this.gameOver) return;
    this.ball.vx = 0;
    if (keysPressed['LEFT'] || keysPressed['4'] || keysPressed['a']) {
      this.ball.vx = -this.ball.speed;
    }
    if (keysPressed['RIGHT'] || keysPressed['6'] || keysPressed['d']) {
      this.ball.vx = this.ball.speed;
    }
  }

  update() {
    if (this.gameOver) return;

    // Move ball horizontally
    this.ball.x += this.ball.vx;
    this.ball.x = Math.max(this.ball.r, Math.min(this.canvas.width - this.ball.r, this.ball.x));

    // Gravity
    this.vy += this.gravity;
    this.ball.y += this.vy;

    // Scroll platforms upwards
    this.platforms.forEach((p, i) => {
      p.y -= this.scrollSpeed;
      if (p.y < 15) {
        this.platforms.splice(i, 1);
        this.score += 10;
      }
    });

    // Spawn new platforms at bottom
    this.spawnTimer++;
    if (this.spawnTimer > 35) {
      this.spawnTimer = 0;
      const rand = Math.random();
      let pType = 'normal';
      if (rand < 0.25) pType = 'spike';
      else if (rand > 0.85) pType = 'heart';

      this.platforms.push({
        x: Math.random() * (this.canvas.width - 60),
        y: this.canvas.height + 10,
        w: 50,
        h: 8,
        type: pType
      });

      this.scrollSpeed += 0.005; // gradually speed up
    }

    // Platform collision
    let standing = false;
    this.platforms.forEach(p => {
      if (
        this.ball.x + this.ball.r > p.x &&
        this.ball.x - this.ball.r < p.x + p.w &&
        this.ball.y + this.ball.r >= p.y &&
        this.ball.y - this.ball.r < p.y + p.h &&
        this.vy >= 0
      ) {
        this.ball.y = p.y - this.ball.r;
        this.vy = -this.scrollSpeed; // move with platform
        standing = true;

        if (p.type === 'spike') {
          this.ballHit();
          p.type = 'normal';
        } else if (p.type === 'heart') {
          if (this.ball.lives < 5) this.ball.lives++;
          window.nokiaAudio.playEatSFX();
          p.type = 'normal';
        }
      }
    });

    // Check Ceiling Spikes & Bottom Drop
    if (this.ball.y <= 16) {
      this.ballHit();
      this.ball.y = 40;
    } else if (this.ball.y > this.canvas.height) {
      this.ballHit();
      this.ball.y = 40;
    }
  }

  ballHit() {
    this.ball.lives--;
    window.nokiaAudio.playDieSFX();
    if (this.ball.lives <= 0) {
      this.gameOver = true;
      if (this.onGameOver) this.onGameOver(this.score);
    }
  }

  render(pixelColor = '#1a3409', bgColor = '#97ba30') {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = pixelColor;

    // Ceiling Spikes
    for (let x = 0; x < this.canvas.width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 5, 12);
      ctx.lineTo(x + 10, 0);
      ctx.fill();
    }

    // Draw Platforms
    this.platforms.forEach(p => {
      if (p.type === 'normal') {
        ctx.fillRect(p.x, p.y, p.w, p.h);
      } else if (p.type === 'spike') {
        ctx.fillRect(p.x, p.y + 4, p.w, 4);
        for (let sx = p.x; sx < p.x + p.w; sx += 8) {
          ctx.beginPath();
          ctx.moveTo(sx, p.y + 4);
          ctx.lineTo(sx + 4, p.y);
          ctx.lineTo(sx + 8, p.y + 4);
          ctx.fill();
        }
      } else if (p.type === 'heart') {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // Heart icon on platform
        ctx.fillStyle = bgColor;
        ctx.fillText('♥', p.x + p.w / 2 - 4, p.y + 7);
        ctx.fillStyle = pixelColor;
      }
    });

    // Draw Ball
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fill();

    // HUD Header
    ctx.font = '16px "VT323", monospace';
    ctx.fillText(`RAPID ROLL PTS:${this.score} LIVES:${'♥'.repeat(this.ball.lives)}`, 6, 26);

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
